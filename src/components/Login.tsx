import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import supabase from '../lib/supabase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [viewPassword, setViewPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert('Error: ' + error.message);
        } else {
            navigate('/admin');
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, width: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LockIcon fontSize="large" color="primary" />
                    <Typography variant="h5" sx={{ ml: 1 }}>Acceso al Sistema</Typography>
                </Box>

                <form onSubmit={handleLogin}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        label="Contraseña"
                        type={viewPassword ? "text" : "password"}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button onClick={() => setViewPassword(!viewPassword)}>
                        {viewPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Ingresar
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}