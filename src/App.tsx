import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TicketValidator from './components/TicketValidator';
import PublicTicket from './components/PublicTicket';
import AuthGuard from './components/AuthGuard';
import EventTickets from './components/EventTickets';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/ticket/:ticketId" element={<PublicTicket />} />

      <Route element={<AuthGuard />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events/:eventId" element={<EventTickets />} />
        <Route path="/admin/validate/:eventId" element={<TicketValidator />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;