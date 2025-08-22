import { configureStore, combineReducers, ThunkAction, Action } from '@reduxjs/toolkit';
import type { Middleware } from 'redux';
import authReducer from '../features/auth/authSlice';
import ticketReducer from '../features/tickets/ticketSlice';
import chatReducer from '../features/chat/chatSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

// Import the socket middleware with a type assertion
const socketMiddleware = require('../middleware/socketMiddleware').default as Middleware;

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  tickets: ticketReducer,
  chat: chatReducer,
  dashboard: dashboardReducer,
});

// Configure the store with proper middleware
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['tickets/setSocket', 'chat/setSocket'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload.callback'],
        ignoredPaths: ['tickets.socket', 'chat.socket'],
      },
    }).concat(socketMiddleware);
  },
});

// Infer the `RootState` and `AppDispatch` types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
