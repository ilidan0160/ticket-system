import { io, Socket } from 'socket.io-client';
import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { addMessage, setTyping } from '../features/chat/chatSlice';
import { setSocket as setTicketSocket } from '../features/tickets/ticketSlice';
import { Ticket, Message as TicketMessage } from '../features/tickets/types';

const socketMiddleware = (): Middleware<{}, RootState> => {
  let socket: Socket | null = null;

  return (store) => (next) => (action: AnyAction) => {
    const { dispatch } = store;
    const { type, payload } = action;

    // Initialize socket connection on user login
    if (type === 'auth/login/fulfilled' || type === 'auth/loadUser/fulfilled') {
      if (socket) {
        socket.disconnect();
      }

      const token = payload?.token || store.getState().auth.token;
      if (!token) return next(action);

      socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: { token },
      });

      // Set up socket event listeners
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      // Ticket events
      socket.on('ticket:created', (ticket: Ticket) => {
        dispatch({ type: 'tickets/updateCurrentTicket', payload: ticket });
      });

      socket.on('ticket:updated', (ticket: Ticket) => {
        dispatch({ type: 'tickets/updateCurrentTicket', payload: ticket });
      });

      socket.on('ticket:deleted', ({ id }: { id: number }) => {
        dispatch({ type: 'tickets/removeTicket', payload: id });
      });

      // Chat events
      socket.on('chat:new_message', (message: TicketMessage) => {
        dispatch({ type: 'tickets/addMessageLocally', payload: message });
        // Also dispatch to chat slice if needed
        dispatch(addMessage(message));
      });

      socket.on('chat:message_updated', (updatedMessage: TicketMessage) => {
        // Handle message update if needed
        console.log('Message updated:', updatedMessage);
      });

      socket.on('chat:message_deleted', ({ id }: { id: string }) => {
        // Handle message deletion if needed
        console.log('Message deleted:', id);
      });

      socket.on('chat:typing', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
        dispatch(setTyping({ userId, isTyping }));
      });

      // Store the socket instance in the Redux store
      dispatch(setTicketSocket(socket));
      // Dispatch to chat slice if it has a setSocket action
      import('../features/chat/chatSlice')
        .then(chatModule => {
          // Use type assertion to avoid TypeScript error
          const chatSlice = chatModule as { setSocket?: (socket: Socket | null) => any };
          if (chatSlice.setSocket) {
            chatSlice.setSocket(socket);
          }
        })
        .catch(error => {
          console.warn('Chat slice not found or does not have setSocket action', error);
        });
    }

    // Handle disconnection on logout
    if (type === 'auth/logout/fulfilled' && socket) {
      socket.disconnect();
      socket = null;
    }

    // Handle chat actions
    if (type === 'chat/sendMessage/pending' && socket) {
      const { ticketId } = payload.arg;
      socket.emit('chat:typing', { ticketId, isTyping: false });
    }

    // Handle typing indicator
    if (type === 'chat/setTyping' && socket) {
      const { ticketId, isTyping } = payload;
      socket.emit('chat:typing', { ticketId, isTyping });
    }

    return next(action);
  };
};

export default socketMiddleware;
