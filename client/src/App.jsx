import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginView from './components/Participant/LoginView';
import WaitingView from './components/Participant/WaitingView';
import DashboardView from './components/Participant/DashboardView';
import Scheduler from './components/Participant/Scheduler';
import VolunteerDashboard from './components/Volunteer/DashBoard';
import './App.css';

function App() {
  const [participant, setParticipant] = useState(() => {
    const storedParticipant = localStorage.getItem('participant');
    if (!storedParticipant) {
      return null;
    }

    try {
      return JSON.parse(storedParticipant);
    } catch {
      localStorage.removeItem('participant');
      return null;
    }
  });

  const [volunteer, setVolunteer] = useState(() => {
    const storedVolunteer = localStorage.getItem('volunteer');
    if (!storedVolunteer) {
      return null;
    }

    try {
      return JSON.parse(storedVolunteer);
    } catch {
      localStorage.removeItem('volunteer');
      return null;
    }
  });

  const handleLogin = (participantData) => {
    localStorage.setItem('participant', JSON.stringify(participantData));
    setParticipant(participantData);
  };

  const handleLogout = () => {
    localStorage.removeItem('participant');
    setParticipant(null);
  };

  const handleVolunteerLogin = (id, password) => {
    if (id === '1' && password === 'i am bored') {
      const volunteerData = { id, role: 'volunteer' };
      localStorage.setItem('volunteer', JSON.stringify(volunteerData));
      setVolunteer(volunteerData);
      return true;
    }
    return false;
  };

  const handleVolunteerLogout = () => {
    localStorage.removeItem('volunteer');
    setVolunteer(null);
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={
          volunteer ? (
            <Navigate to="/volunteer-dashboard" replace />
          ) : !participant ? (
            <LoginView onLogin={handleLogin} onVolunteerLogin={handleVolunteerLogin} />
          ) : participant.is_checked_in ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/waiting" replace />
          )
        } />
        
        <Route path="/waiting" element={
          participant && !participant.is_checked_in ? (
            <WaitingView participant={participant} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        <Route path="/dashboard" element={
          participant ? (
            <DashboardView participant={participant} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="/scheduler" element={
          participant ? (
            <Scheduler />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/volunteer-dashboard" element={
          volunteer ? (
            <VolunteerDashboard volunteer={volunteer} onLogout={handleVolunteerLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        <Route path="/scheduler" element={
          <Navigate to="/scheduler" replace />
        } />
      </Routes>
    </div>
  );
}

export default App;
