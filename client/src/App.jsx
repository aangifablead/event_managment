import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import AuthPage from './pages/AuthPage'; 
import UserManagement from './pages/userPage';
import EventPage from './pages/eventPage';
import EventDetails from './pages/eventDetail';
import CalendarPage from './pages/CalendarPage';
import BookingsDashboard from './pages/BookingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />

        <Route path="/" element={<Layout><UserManagement/></Layout>} />
        <Route path="/events" element={<Layout><EventPage/></Layout>} />
        <Route path="/events/:id" element={<Layout><EventDetails/></Layout>} />
        <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
        <Route path="/bookings" element={<Layout><BookingsDashboard/></Layout>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
export default App;