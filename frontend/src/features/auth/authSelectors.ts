import { RootState } from '../../app/store';

// Select the entire auth state
const selectAuthState = (state: RootState) => state.auth;

// Select the current user
export const selectCurrentUser = (state: RootState) => selectAuthState(state).user;

// Check if user is authenticated
export const selectIsAuthenticated = (state: RootState) => selectAuthState(state).isAuthenticated;

// Get authentication loading state
export const selectAuthLoading = (state: RootState) => selectAuthState(state).loading;

// Get authentication error
export const selectAuthError = (state: RootState) => selectAuthState(state).error;

// Get authentication token
export const selectAuthToken = (state: RootState) => selectAuthState(state).token;
