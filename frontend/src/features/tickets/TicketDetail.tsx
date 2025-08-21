import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { fetchTicketById, updateTicket, addMessage } from './ticketSlice';
import {
  Box, Button, Card, CardContent, CardHeader, Chip, CircularProgress,
  Container, Divider, Grid, IconButton, List, ListItem, ListItemAvatar,
  ListItemText, Paper, TextField, Typography, Avatar, Menu, MenuItem,
  Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  InputLabel, Select, Tabs, Tab, Badge
} from '@mui/material';
import {
  ArrowBack, Edit, Delete, Check, Close, Send, AttachFile,
  Person, Assignment, AssignmentInd, PriorityHigh, Event, Update,
  Chat, Description, History, Info
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusOptions = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'cerrado', label: 'Cerrado' },
];

const priorityOptions = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const statusColors = {
  abierto: 'primary', en_progreso: 'warning', pendiente: 'info',
  resuelto: 'success', cerrado: 'default'
};

const priorityColors = {
  baja: 'success', media: 'warning', alta: 'error', critica: 'error'
};

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { currentTicket, loading, error, updating } = useSelector(
    (state: RootState) => state.tickets
  );
  
  const { user } = useSelector((state: RootState) => state.auth);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    asunto: '', descripcion: '', estado: '', prioridad: '', asignadoA: ''
  });
  
  // Fetch ticket data
  useEffect(() => {
    if (id) dispatch(fetchTicketById(parseInt(id)));
  }, [dispatch, id]);
  
  // Update edit data
  useEffect(() => {
    if (currentTicket) {
      setEditData({
        asunto: currentTicket.asunto || '',
        descripcion: currentTicket.descripcion || '',
        estado: currentTicket.estado || 'abierto',
        prioridad: currentTicket.prioridad || 'media',
        asignadoA: currentTicket.asignadoA?.id?.toString() || '',
      });
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentTicket]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentTicket) return;
    
    try {
      await dispatch(addMessage({
        ticketId: currentTicket.id,
        message: message.trim(),
        isInternal: false,
      })).unwrap();
      
      setMessage('');
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading && !currentTicket) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>Error: {error}</Typography>
          <Button
            variant="contained"
            onClick={() => id && dispatch(fetchTicketById(parseInt(id)))}
            startIcon={<Update />}
          >Reintentar</Button>
          <Button variant="outlined" onClick={() => navigate(-1)} sx={{ ml: 2 }} startIcon={<ArrowBack />}>
            Volver
          </Button>
        </Paper>
      </Container>
    );
  }
  
  if (!currentTicket) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Ticket no encontrado</Typography>
          <Button variant="contained" onClick={() => navigate(-1)} startIcon={<ArrowBack />}>
            Volver a la lista
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Volver
      </Button>
      
      <Grid container spacing={3}>
        {/* Ticket Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Ticket #{currentTicket.id}</Typography>
                  {user?.role === 'admin' && (
                    <IconButton onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? <Close /> : <Edit />}
                    </IconButton>
                  )}
                </Box>
              }
            />
            <CardContent>
              {isEditing ? (
                <Box component="form" noValidate autoComplete="off">
                  <TextField
                    fullWidth
                    label="Asunto"
                    name="asunto"
                    value={editData.asunto}
                    onChange={(e) => setEditData({...editData, asunto: e.target.value})}
                    margin="normal"
                    variant="outlined"
                  />
                  {/* Add other form fields */}
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" gutterBottom>{currentTicket.asunto}</Typography>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    {currentTicket.descripcion}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <List disablePadding>
                    <ListItem disableGutters>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}><Assignment /></Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Estado" 
                        secondary={
                          <Chip 
                            label={currentTicket.estado.replace('_', ' ')}
                            color={statusColors[currentTicket.estado as keyof typeof statusColors] || 'default'}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    {/* Add other list items */}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Chat */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Conversación" />
            <CardContent sx={{ height: '60vh', overflowY: 'auto' }}>
              <List>
                {currentTicket.mensajes?.map((msg) => (
                  <ListItem key={msg.id} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={msg.usuario?.avatar}>
                        {msg.usuario?.username?.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={msg.usuario?.username}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {msg.mensaje}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatDistanceToNow(new Date(msg.createdAt), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
                <div ref={messagesEndRef} />
              </List>
            </CardContent>
            <Box component="form" onSubmit={handleSendMessage} p={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Escribe un mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton type="submit" color="primary" disabled={!message.trim()}>
                      <Send />
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TicketDetail;
