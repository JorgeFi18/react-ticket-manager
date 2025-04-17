import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Fab,
  AppBar,
  Toolbar
} from '@mui/material';
import { Add, Logout, Event } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import CreateEventModal from './CreateEventModal';
import { Event as EventType } from '../types';

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch user role and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, name, date, place, max_tickets')
          .order('date', { ascending: true });

        if (eventsError) throw eventsError;
        setEvents(eventsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading events');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateEvent = async () => {
    setModalOpen(true);
  };

  const handleEventCreated = (newEvent: EventType) => {
    setEvents([...events, newEvent]);
    setModalOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ pb: 7 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Gestión de Eventos
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Eventos Registrados
        </Typography>

        {events.length === 0 ? (
          <Alert severity="info">No hay eventos registrados</Alert>
        ) : (
          events.map((event) => (
            <Card key={event.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Event color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">{event.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Fecha: {new Date(event.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lugar: {event.place}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Límite de tickets: {event.max_tickets || 'Ilimitado'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small"
                  onClick={() => navigate(`/admin/events/${event.id}`)}
                >
                  Ver Tickets
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  onClick={() => navigate(`/admin/validate/${event.id}`)}
                >
                  Validar Tickets
                </Button>
              </CardActions>
            </Card>
          ))
        )}
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateEvent}
      >
        <Add />
      </Fab>

      <CreateEventModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </Box>
  );
}