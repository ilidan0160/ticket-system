import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { 
  fetchTickets, 
  selectLoading, 
  selectTicketPagination,
  selectTickets
} from './ticketSlice';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

type Status = 'abierto' | 'en_progreso' | 'pendiente' | 'resuelto' | 'cerrado' | 'rechazado' | 'cancelado';
type Priority = 'baja' | 'media' | 'alta' | 'critica' | 'urgente';
type ColorVariant = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const statusColors: Record<Status, ColorVariant> = {
  abierto: 'primary',
  en_progreso: 'warning',
  pendiente: 'info',
  resuelto: 'success',
  cerrado: 'default',
  rechazado: 'error',
  cancelado: 'error',
};

const priorityColors: Record<Priority, ColorVariant> = {
  baja: 'success',
  media: 'warning',
  alta: 'error',
  critica: 'error',
  urgente: 'error',
};

const TicketList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const loading = useAppSelector(selectLoading);
  const tickets = useAppSelector(selectTickets);
  const { total } = useAppSelector(selectTicketPagination);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchTicketsData = useCallback(async () => {
    try {
      await dispatch(fetchTickets({ 
        page: page + 1, 
        limit: rowsPerPage,
      }));
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  }, [dispatch, page, rowsPerPage]);

  useEffect(() => {
    fetchTicketsData();
  }, [fetchTicketsData]);

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (ticketId: number) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleNewTicket = () => {
    navigate('/tickets/new');
  };

  // Función para actualizar la lista de tickets
  // const refreshTickets = useCallback(() => {
  //   fetchTicketsData();
  // }, [fetchTicketsData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                  <Typography variant="h5" component="h1">
                    Tickets
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNewTicket}
                    sx={{ ml: 2 }}
                  >
                    Nuevo Ticket
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Asunto</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Prioridad</TableCell>
                      <TableCell>Creado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="textSecondary">
                            No se encontraron tickets
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tickets.map((ticket: any) => (
                        <TableRow
                          key={ticket.id}
                          hover
                          onClick={() => handleRowClick(ticket.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>#{ticket.id}</TableCell>
                          <TableCell>{ticket.asunto}</TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.estado}
                              color={statusColors[ticket.estado as Status] || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.prioridad}
                              color={priorityColors[ticket.prioridad as Priority] || 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TicketList;
