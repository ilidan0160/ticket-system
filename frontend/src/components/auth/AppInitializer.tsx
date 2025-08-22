import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { fetchUser } from '../../features/auth/authSlice';

const AppInitializer = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Load user data when the app starts if a token exists
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchUser())
        .unwrap()
        .catch((error: unknown) => {
          console.error('Failed to load user data:', error);
          // Clear invalid token if any
          localStorage.removeItem('token');
        });
    }
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default AppInitializer;
