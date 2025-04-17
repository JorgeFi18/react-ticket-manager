import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import supabase from '../lib/supabase';
import { Event } from '../types';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onEventCreated: (event: Event) => void;
}

export default function CreateEventModal({ 
  open, 
  onClose,
  onEventCreated 
}: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: null as Date | null,
    place: '',
    max_tickets: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);

      // Validación básica
      if (!formData.name || !formData.date || !formData.place) {
        throw new Error('Todos los campos requeridos deben estar completos');
      }

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Insertar evento en Supabase
      const { data, error: supabaseError } = await supabase
        .from('events')
        .insert({
          name: formData.name,
          date: formData.date?.toISOString(),
          place: formData.place,
          max_tickets: formData.max_tickets,
          created_by: user.id
        })
        .select('*')
        .single();

      if (supabaseError) throw supabaseError;

      // Notificar éxito y resetear formulario
      onEventCreated(data);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear evento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      date: null,
      place: '',
      max_tickets: 0
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear Nuevo Evento</DialogTitle>
      
      <DialogContent dividers sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Nombre del Evento"
          fullWidth
          margin="normal"
          required
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />

        <DateTimePicker
          label="Fecha y Hora del Evento"
          value={formData.date}
          onChange={(newValue) => setFormData({...formData, date: newValue})}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: 'normal',
              required: true
            }
          }}
        />

        <TextField
          label="Lugar del Evento"
          fullWidth
          margin="normal"
          required
          value={formData.place}
          onChange={(e) => setFormData({...formData, place: e.target.value})}
        />

        <TextField
          label="Límite de Tickets"
          type="number"
          fullWidth
          margin="normal"
          InputProps={{
            inputProps: { min: 0 },
            endAdornment: <InputAdornment position="end">tickets</InputAdornment>,
          }}
          value={formData.max_tickets}
          onChange={(e) => setFormData({
            ...formData, 
            max_tickets: parseInt(e.target.value) || 0
          })}
          helperText="0 = Ilimitado"
        />
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          color="inherit"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creando...' : 'Crear Evento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}