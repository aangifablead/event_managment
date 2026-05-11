import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import AuthPage from './pages/AuthPage'; 
// import Dashboard from './pages/Dashboard';
// import Bookings from './pages/Bookings';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />

        <Route path="/" element={<Layout><div>Dashboard Content</div></Layout>} />
        <Route path="/events" element={<Layout><div>Events Content</div></Layout>} />
        <Route path="/calendar" element={<Layout><div>Calendar Content</div></Layout>} />
        <Route path="/bookings" element={<Layout><div>Bookings Content</div></Layout>} />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
export default App;