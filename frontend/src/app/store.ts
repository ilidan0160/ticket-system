import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '../features/auth/authSlice';
import ticketReducer from '../features/tickets/ticketSlice';
import chatReducer from '../features/chat/chatSlice';
import { socketMiddleware } from '../middleware/socketMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['tickets/setSocket', 'chat/setSocket'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload.callback'],
        ignoredPaths: ['tickets.socket', 'chat.socket'],
      },
    }).concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
