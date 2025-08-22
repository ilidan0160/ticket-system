import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../authSlice';
import { 
  selectIsAuthenticated, 
  selectAuthError, 
  selectAuthLoading 
} from '../authSelectors';
import { AppDispatch } from '../../../app/store';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Alert, 
  CircularProgress,
  Button,
  TextField
} from '@mui/material';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';

// Validation Schema
const validationSchema = Yup.object().shape({
  email: Yup.string().email('Correo electrónico inválido').required('El correo es requerido'),
  password: Yup.string().required('La contraseña es requerida')
});

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const error = useSelector(selectAuthError);
  const loading = useSelector(selectAuthLoading);

  useEffect(() => {
    dispatch(clearError());
    
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await (dispatch as any)(login(values));
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Typography component="h1" variant="h5">
          Iniciar sesión
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, width: '100%' }}>
          <Formik
            initialValues={{
              email: '',
              password: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <Box mb={2}>
                  <Field name="email">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        name="email"
                        type="email"
                        label="Correo electrónico"
                        fullWidth
                        margin="normal"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                      />
                    )}
                  </Field>
                </Box>
                
                <Box mb={2}>
                  <Field name="password">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        name="password"
                        type="password"
                        label="Contraseña"
                        fullWidth
                        margin="normal"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                      />
                    )}
                  </Field>
                </Box>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading || isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Iniciar sesión'}
                </Button>
              </Form>
            )}
          </Formik>
          
          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              ¿No tienes una cuenta?{' '}
              <Typography 
                component="span" 
                color="primary" 
                sx={{ 
                  cursor: 'pointer', 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' } 
                }}
                onClick={() => navigate('/register')}
              >
                Regístrate
              </Typography>
            </Typography>
            
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ 
                mt: 1, 
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' } 
              }}
              onClick={() => navigate('/forgot-password')}
            >
              ¿Olvidaste tu contraseña?
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
