import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { fetchTickets } from './ticketSlice';
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
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Assignment as TicketIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const statusColors = {
  abierto: 'primary',
  en_progreso: 'warning',
  pendiente: 'info',
  resuelto: 'success',
  cerrado: 'default',
};

const priorityColors = {
  baja: 'success',
  media: 'warning',
  alta: 'error',
  critica: 'error',
};

const TicketList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { tickets, loading, error, pagination } = useSelector(
    (state: RootState) => state.tickets
  );
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  });
  
  // Fetch tickets when component mounts or filters change
  useEffect(() => {
    const params = {
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm,
      ...filters,
    };
    
    dispatch(fetchTickets(params));
  }, [dispatch, page, rowsPerPage, searchTerm, filters]);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleFilterChange = (event: any) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };
  
  const handleRefresh = () => {
    dispatch(fetchTickets({
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm,
      ...filters,
    }));
  };
  
  const handleRowClick = (ticketId: number) => {
    navigate(`/tickets/${ticketId}`);
  };
  
  const handleNewTicket = () => {
    navigate('/tickets/new');
  };
  
  if (loading && page === 0) {
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
          <Typography color="error" gutterBottom>
            Error al cargar los tickets: {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
          >
            Reintentar
          </Button>
        </Paper>
      </Container>
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
                  <TicketIcon sx={{ mr: 1 }} />
                  <Typography variant="h5" component="h1">
                    Tickets
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleNewTicket}
                >
                  Nuevo Ticket
                </Button>
              </Box>
              
              <Box mb={3} display="flex" flexWrap="wrap" gap={2}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1, maxWidth: 400 }}
                />
                
                <Box display="flex" gap={1} flexWrap="wrap">
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="status-filter-label">Estado</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      id="status-filter"
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      label="Estado"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="abierto">Abierto</MenuItem>
                      <MenuItem value="en_progreso">En Progreso</MenuItem>
                      <MenuItem value="pendiente">Pendiente</MenuItem>
                      <MenuItem value="resuelto">Resuelto</MenuItem>
                      <MenuItem value="cerrado">Cerrado</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="priority-filter-label">Prioridad</InputLabel>
                    <Select
                      labelId="priority-filter-label"
                      id="priority-filter"
                      name="priority"
                      value={filters.priority}
                      onChange={handleFilterChange}
                      label="Prioridad"
                    >
                      <MenuItem value="">Todas</MenuItem>
                      <MenuItem value="baja">Baja</MenuItem>
                      <MenuItem value="media">Media</MenuItem>
                      <MenuItem value="alta">Alta</MenuItem>
                      <MenuItem value="critica">Crítica</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Tooltip title="Filtros">
                    <IconButton
                      aria-label="filters"
                      onClick={() => {}}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                      }}
                    >
                      <FilterListIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Actualizar">
                    <IconButton
                      aria-label="refresh"
                      onClick={handleRefresh}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
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
                      <TableCell>Solicitante</TableCell>
                      <TableCell>Asignado a</TableCell>
                      <TableCell>Última actualización</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Box display="flex" flexDirection="column" alignItems="center">
                            <TicketIcon fontSize="large" color="action" sx={{ mb: 1 }} />
                            <Typography variant="subtitle1" color="textSecondary">
                              No se encontraron tickets
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                              {searchTerm || Object.values(filters).some(f => f) 
                                ? 'Intenta con otros criterios de búsqueda' 
                                : 'Crea un nuevo ticket para comenzar'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tickets.map((ticket) => (
                        <TableRow 
                          key={ticket.id} 
                          hover 
                          onClick={() => handleRowClick(ticket.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>#{ticket.id}</TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">{ticket.asunto}</Typography>
                            <Typography variant="body2" color="textSecondary" noWrap>
                              {ticket.descripcion?.substring(0, 100)}{ticket.descripcion?.length > 100 ? '...' : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={ticket.estado.replace('_', ' ')}
                              color={statusColors[ticket.estado] || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={ticket.prioridad}
                              color={priorityColors[ticket.prioridad] || 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar 
                                src={ticket.solicitante?.avatar} 
                                sx={{ width: 24, height: 24, mr: 1 }}
                              >
                                {ticket.solicitante?.username?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="body2">
                                {ticket.solicitante?.username || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {ticket.asignadoA ? (
                              <Box display="flex" alignItems="center">
                                <Avatar 
                                  src={ticket.asignadoA.avatar} 
                                  sx={{ width: 24, height: 24, mr: 1 }}
                                >
                                  {ticket.asignadoA.username?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2">
                                  {ticket.asignadoA.username}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                Sin asignar
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDistanceToNow(new Date(ticket.updatedAt), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(ticket.updatedAt).toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {pagination && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={pagination.total || 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                  }
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TicketList;
