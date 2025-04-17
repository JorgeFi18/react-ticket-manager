import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import supabase from '../lib/supabase';

interface TicketData {
  eventId: string;
  id: string;
  name: string;
  phone: string;
  document: string;
}

export default function TicketValidator() {
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [isTicketInValid, setIsTicketInValid] = useState(true);
  const navigate = useNavigate();

  const handleScan = (data: IDetectedBarcode[]) => {
    if (data) {
      // Lógica de validación con Supabase
      console.log('Ticket escaneado:', data);
      const qr = data[0].rawValue;
      // Convert base64 to object
      const decodedData = JSON.parse(atob(qr));
      console.log('Decoded data:', decodedData);
      setTicketData(decodedData);
      checkTicket(decodedData);
    }
  };

  const checkTicket = async (data: TicketData) => {
    if (!data) return;
    const { error, data: tickets } = await supabase.from('tickets').select('*').eq('id', data.id);

    if (error) {
      toast.error('Error: ' + error.message);
      return;
    }
    console.log(tickets[0]);
    if (tickets[0].is_valid) {
      toast.error('Ticket ya ha sido validado');
      setIsTicketInValid(true);
    } else {
      setIsTicketInValid(false);
    }
  };

  const validateTicket = async () => {
    if (!ticketData) return;

    const { error } = await supabase.from('tickets').update({
      is_valid: true,
      validated_by: (await supabase.auth.getUser()).data.user?.id,
      validated_at: new Date().toISOString()
    }).eq('id', ticketData.id);

    if (error) toast.error('Error: ' + error.message);
    else toast.success('Ticket validado exitosamente');
  };

  return (
    <div>
       <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin')}
        sx={{ mb: 3 }}
      >
        Volver a Eventos
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Validación de Tickets</Typography>
      </Box>
      <Scanner
        onScan={handleScan}
        onError={(error) => console.error(error)}
        styles={{
          container: {
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto'
          }
        }}
      />

      {ticketData && (
        <div>
          {isTicketInValid && (
            <Alert severity="error">
              El ticket ya ha sido validado
            </Alert>
          )}
          <p>Nombre: {ticketData.name}</p>
          <p>Telefono: {ticketData.phone}</p>
          <p>Identificacion: {ticketData.document}</p>
          <Button
            onClick={validateTicket}
            size="small"
            variant="contained"
            disabled={isTicketInValid}
          >
            Confirmar Validación
          </Button>
        </div>
      )}
    </div>
  );
}