import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { createTicket } from './ticketSlice';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { ArrowBack, Save } from '@mui/icons-material';

const priorityOptions = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const categoryOptions = [
  { value: 'soporte_tecnico', label: 'Soporte Técnico' },
  { value: 'facturacion', label: 'Facturación' },
  { value: 'cuenta', label: 'Cuenta' },
  { value: 'otro', label: 'Otro' },
];

const CreateTicketForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.tickets);
  const user = useSelector((state: RootState) => state.auth.user);
  
  interface FormData {
    title: string;
    description: string;
    priority: 'baja' | 'media' | 'alta' | 'critica' | '';
    status: 'abierto' | 'en_progreso' | 'en_espera' | 'resuelto' | 'cerrado';
    categoryId: string;
    categoria: string;
    asunto: string;
    descripcion: string;
    prioridad: string;
    estado: string;
    assignedToId?: string;
    asignadoAId?: string;
  }

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: '',
    status: 'abierto',
    categoryId: '',
    categoria: '',
    asunto: '',
    descripcion: '',
    prioridad: '',
    estado: 'abierto',
  });
  
  const [errors, setErrors] = useState<{
    asunto?: string;
    descripcion?: string;
  }>({});
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.asunto.trim()) {
      newErrors.asunto = 'El asunto es requerido';
    } else if (formData.asunto.length < 5) {
      newErrors.asunto = 'El asunto debe tener al menos 5 caracteres';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when user types
      if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined,
        }));
      }
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      // Convert to number for numeric fields
      const processedValue = (name === 'asignadoAId' && value !== '') 
        ? Number(value) 
        : value;
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
      
      // Clear error when user types
      if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      // Map form data to API expected format
      const ticketData = {
        asunto: formData.asunto,
        descripcion: formData.descripcion,
        prioridad: formData.prioridad as 'baja' | 'media' | 'alta' | 'critica',
        estado: formData.estado as 'abierto' | 'en_progreso' | 'en_espera' | 'resuelto' | 'cerrado',
        categoria: formData.categoria,
        solicitanteId: Number(user.id),
        asignadoAId: formData.asignadoAId ? Number(formData.asignadoAId) : null,
      };
      
      const resultAction = await dispatch(createTicket(ticketData));
      
      if (createTicket.fulfilled.match(resultAction)) {
        setSnackbarMessage('Ticket creado exitosamente');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Redirect to the new ticket after a short delay
        setTimeout(() => {
          navigate(`/tickets/${resultAction.payload.id}`);
        }, 1500);
      } else {
        throw new Error('Error al crear el ticket');
      }
    } catch (err) {
      setSnackbarMessage('Error al crear el ticket. Por favor, intente nuevamente.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>
      
      <Card>
        <CardHeader 
          title="Nuevo Ticket de Soporte" 
          subheader="Complete el formulario para crear un nuevo ticket"
        />
        
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  id="asunto"
                  name="asunto"
                  label="Asunto"
                  value={formData.asunto}
                  onChange={handleInputChange}
                  error={!!errors.asunto}
                  helperText={errors.asunto || 'Un título claro y descriptivo'}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="prioridad-label">Prioridad</InputLabel>
                  <Select
                    labelId="prioridad-label"
                    id="prioridad"
                    name="prioridad"
                    value={formData.prioridad}
                    label="Prioridad"
                    onChange={handleSelectChange}
                    disabled={loading}
                  >
                    {priorityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="categoria-label">Categoría</InputLabel>
                  <Select
                    labelId="categoria-label"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    label="Categoría"
                    onChange={handleSelectChange}
                    disabled={loading}
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={6}
                  id="descripcion"
                  name="descripcion"
                  label="Descripción detallada"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  error={!!errors.descripcion}
                  helperText={
                    errors.descripcion || 
                    'Describa su problema o solicitud con el mayor detalle posible. Incluya cualquier mensaje de error, pasos para reproducir el problema, etc.'
                  }
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  >
                    {loading ? 'Creando...' : 'Crear Ticket'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateTicketForm;
