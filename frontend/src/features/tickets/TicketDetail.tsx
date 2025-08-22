import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { fetchTicketById } from './ticketSlice';
import {
  Box, Button, Card, CardContent, CardHeader, Chip, CircularProgress,
  Container, IconButton, List, ListItem, ListItemAvatar,
  ListItemText, TextField, Avatar, Grid, ChipProps, Paper,
  Typography, Divider
} from '@mui/material';
import {
  ArrowBack, Edit, Close, Send, Assignment, Update
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  statusColors, 
  type EditTicketData,
  type Message as MessageType
} from './types/ticketDetail';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const ticketsState = useSelector((state: RootState) => state.tickets);
  const { currentTicket, loading } = ticketsState;
  
  const authState = useSelector((state: RootState) => state.auth);
  const user = authState.user;
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditTicketData>({
    asunto: '', 
    descripcion: '', 
    estado: 'abierto', 
    prioridad: 'media', 
    asignadoA: ''
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
      
      // Scroll to bottom of messages
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentTicket]);
  
  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id || !id) return;
    
    try {
      // TODO: Implement message sending functionality
      console.log('Sending message:', message);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading && !currentTicket) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (ticketsState.error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>Error: {ticketsState.error}</Typography>
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
                    color={statusColors[currentTicket.estado as keyof typeof statusColors] as ChipProps['color'] || 'default'}
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
                {currentTicket.mensajes?.map((msg: MessageType) => (
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
                    <IconButton 
                      type="submit" 
                      color="primary" 
                      disabled={!message.trim()}
                      aria-label="enviar mensaje"
                    >
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
