import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  Chip 
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import supabase from '../lib/supabase';
import EventIcon from '@mui/icons-material/Event';

interface Ticket {
  id: string;
  name: string;
  phone: string;
  document?: string;
  is_valid: boolean;
  event_id: string;
}

interface Event {
  name: string;
  date: string;
  place: string;
}

export default function PublicTicket() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        if (!ticketId) {
          throw new Error('ID de ticket no proporcionado');
        }

        // Obtener datos del ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', ticketId)
          .single();

        if (ticketError) throw ticketError;
        setTicket(ticketData);

        // Obtener datos del evento relacionado
        if (ticketData?.event_id) {
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('name, date, place')
            .eq('id', ticketData.event_id)
            .single();

          if (eventError) throw eventError;
          setEvent(eventData);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando el ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [ticketId]);

  const generateQRData = () => {
    if (!ticket) return '';
    return JSON.stringify({
      id: ticket.id,
      name: ticket.name,
      eventId: ticket.event_id,
      phone: ticket.phone,
      document: ticket.document
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !ticket) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error || 'Ticket no encontrado'}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 600, 
      mx: 'auto', 
      p: 3, 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Card sx={{ mb: 2, flexGrow: 1 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            gap: 1
          }}>
            <EventIcon color="primary" />
            <Typography variant="h5" component="div">
              Tu Ticket Digital
            </Typography>
            <Chip
              label={ticket.is_valid ? "Validado" : "Pendiente"} 
              color={ticket.is_valid ? "success" : "warning"}
              sx={{ ml: 'auto' }}
            />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2,
            mb: 3
          }}>
            <QRCodeSVG
              value={btoa(generateQRData())}
              size={256}
              level="H"
              fgColor="#2d3748"
            />
          </Box>
          {event && (
            <Box sx={{ 
            py: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            textAlign: 'center'
            }}>
            <Typography variant="h4" color="text.secondary">
                {event.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {new Date(event.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {event.place}
            </Typography>
            </Box>
        )}

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 2 
          }}>
            <div>
              <Typography variant="subtitle2" color="text.secondary">
                Nombre
              </Typography>
              <Typography variant="body1">{ticket.name}</Typography>
            </div>

            <div>
              <Typography variant="subtitle2" color="text.secondary">
                Teléfono
              </Typography>
              <Typography variant="body1">{ticket.phone}</Typography>
            </div>

            {ticket.document && (
              <div>
                <Typography variant="subtitle2" color="text.secondary">
                  Documento
                </Typography>
                <Typography variant="body1">{ticket.document}</Typography>
              </div>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}