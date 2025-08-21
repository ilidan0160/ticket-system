import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';

interface Message {
  id: number;
  mensaje: string;
  isInternal: boolean;
  ticketId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  isTyping: boolean;
  typingUsers: { [key: string]: boolean };
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  isTyping: false,
  typingUsers: {},
};

// Helper function to get auth header
const getAuthHeader = (getState: () => unknown) => ({
  headers: {
    Authorization: `Bearer ${(getState() as RootState).auth.token}`,
  },
});

// Async thunks
export const fetchChatMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (ticketId: number, { getState }) => {
    const response = await axios.get(
      `/api/chat/ticket/${ticketId}`,
      getAuthHeader(getState)
    );
    return response.data;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    { ticketId, message, isInternal = false }: { ticketId: number; message: string; isInternal?: boolean },
    { getState }
  ) => {
    const response = await axios.post(
      '/api/chat/message',
      { ticketId, message, isInternal },
      getAuthHeader(getState)
    );
    return response.data;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action: PayloadAction<{ userId: string; isTyping: boolean }>) => {
      const { userId, isTyping } = action.payload;
      state.typingUsers = {
        ...state.typingUsers,
        [userId]: isTyping,
      };
    },
    clearChat: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      });
  },
});

export const { addMessage, setTyping, clearChat } = chatSlice.actions;

export default chatSlice.reducer;

export const selectMessages = (state: RootState) => state.chat.messages;
export const selectChatLoading = (state: RootState) => state.chat.loading;
export const selectChatError = (state: RootState) => state.chat.error;
export const selectTypingUsers = (state: RootState) => state.chat.typingUsers;
