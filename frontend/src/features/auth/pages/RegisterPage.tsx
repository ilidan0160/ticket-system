import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../authSlice';
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
import { Formik, Form, Field } from 'formik';
import type { FieldProps } from 'formik';
import * as Yup from 'yup';

// Validation Schema
const validationSchema = Yup.object().shape({
  username: Yup.string().required('El nombre de usuario es requerido'),
  email: Yup.string().email('Correo electrónico inválido').required('El correo es requerido'),
  password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('La confirmación de contraseña es requerida')
});

const RegisterPage: React.FC = () => {
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

  const handleSubmit = async (values: { 
    username: string; 
    email: string; 
    password: string;
  }) => {
    try {
      await (dispatch as any)(register(values));
    } catch (error) {
      console.error('Registration failed:', error);
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
          Crear cuenta
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, width: '100%' }}>
          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              confirmPassword: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <Box mb={2}>
                  <Field name="username">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        name="username"
                        label="Nombre de usuario"
                        fullWidth
                        margin="normal"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                      />
                    )}
                  </Field>
                </Box>
                
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
                
                <Box mb={2}>
                  <Field name="confirmPassword">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        name="confirmPassword"
                        type="password"
                        label="Confirmar contraseña"
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
                  {loading ? <CircularProgress size={24} /> : 'Registrarse'}
                </Button>
              </Form>
            )}
          </Formik>
          
          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              ¿Ya tienes una cuenta?{' '}
              <Typography 
                component="span" 
                color="primary" 
                sx={{ 
                  cursor: 'pointer', 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' } 
                }}
                onClick={() => navigate('/login')}
              >
                Inicia sesión
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
