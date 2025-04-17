import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import supabase from '../lib/supabase';
import { useState } from 'react';

export default function AuthGuard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const userLocal = localStorage.getItem('user');
      if (userLocal) {
        setUser(JSON.parse(userLocal));
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <div>Cargando...</div>;
  return user ? <Outlet /> : <Navigate to="/login" />;
}