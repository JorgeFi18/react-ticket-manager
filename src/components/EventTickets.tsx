import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Fab
} from '@mui/material';
import { Add, ArrowBack, Delete, Visibility } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';

interface Ticket {
  id: string;
  name: string;
  phone: string;
  document?: string;
  is_valid: boolean;
}

export default function EventTickets() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    name: '',
    phone: '',
    document: ''
  });

  // Obtener tickets del evento
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('event_id', eventId);

        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleCreateTicket = async () => {
    try {
      setError('');
      if (!newTicket.name || !newTicket.phone) {
        throw new Error('Nombre y teléfono son requeridos');
      }

      const { data, error } = await supabase
        .from('tickets')
        .insert([{
          ...newTicket,
          event_id: eventId
        }])
        .select();

      if (error) throw error;

      setTickets([data[0], ...tickets]);
      setModalOpen(false);
      setNewTicket({ name: '', phone: '', document: '' });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando ticket');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;

      setTickets(tickets.filter(t => t.id !== ticketId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando ticket');
    }
  };

  const checkTicket = async (ticketId: string) => {
   navigate(`/ticket/${ticketId}`);
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin')}
        sx={{ mb: 3 }}
      >
        Volver a Eventos
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestión de Tickets</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: { xs: 300, sm: 650 } }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Teléfono</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Documento</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell sx={{ maxWidth: { xs: '120px' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ticket.name}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{ticket.phone}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{ticket.document || 'N/A'}</TableCell>
                <TableCell>
                  <Box sx={{
                    color: ticket.is_valid ? 'success.main' : 'warning.main',
                    fontWeight: 'bold'
                  }}>
                    {ticket.is_valid ? 'Validado' : 'Pendiente'}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteTicket(ticket.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => checkTicket(ticket.id)}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setModalOpen(true)}
      >
        <Add />
      </Fab>

      {/* Modal de creación */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Crear Nuevo Ticket</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Nombre completo"
            fullWidth
            margin="normal"
            required
            value={newTicket.name}
            onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
          />
          <TextField
            label="Teléfono"
            fullWidth
            margin="normal"
            required
            value={newTicket.phone}
            onChange={(e) => setNewTicket({ ...newTicket, phone: e.target.value })}
          />
          <TextField
            label="Documento (opcional)"
            fullWidth
            margin="normal"
            value={newTicket.document}
            onChange={(e) => setNewTicket({ ...newTicket, document: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateTicket}
            disabled={!newTicket.name || !newTicket.phone}
          >
            Crear Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}