import { io, Socket } from 'socket.io-client';
import { Middleware, Dispatch, AnyAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { addMessage, setTyping } from '../features/chat/chatSlice';
import { addTicket, updateTicketSuccess, removeTicket } from '../features/tickets/ticketSlice';

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
      socket.on('ticket:created', (ticket) => {
        dispatch(addTicket(ticket));
      });

      socket.on('ticket:updated', (ticket) => {
        dispatch(updateTicketSuccess(ticket));
      });

      socket.on('ticket:deleted', ({ id }) => {
        dispatch(removeTicket(id));
      });

      // Chat events
      socket.on('chat:new_message', (message) => {
        dispatch(addMessage(message));
      });

      socket.on('chat:message_updated', (message) => {
        // Handle message update if needed
      });

      socket.on('chat:message_deleted', ({ id }) => {
        // Handle message deletion if needed
      });

      socket.on('chat:typing', ({ userId, ticketId, isTyping }) => {
        dispatch(setTyping({ userId, isTyping }));
      });

      // Store the socket instance in the Redux store
      dispatch({ type: 'tickets/setSocket', payload: socket });
      dispatch({ type: 'chat/setSocket', payload: socket });
    }

    // Handle disconnection on logout
    if (type === 'auth/logout/fulfilled' && socket) {
      socket.disconnect();
      socket = null;
    }

    // Handle chat actions
    if (type === 'chat/sendMessage/pending' && socket) {
      const { ticketId, message } = payload.arg;
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
