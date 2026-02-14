import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MapPin, AlertCircle, Info, Calendar, Navigation } from 'lucide-react';
import axios from 'axios';
import styles from './DashboardView.module.css';

const DashboardView = ({ participant, onLogout }) => {
  const [updates, setUpdates] = useState([]);
  const [scheduleEvents, setScheduleEvents] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const buildDate = (dateKey) => {
    const [year, month, day] = String(dateKey).split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const parseTimeOnDate = (dateKey, timeValue) => {
    if (!dateKey || !timeValue) return null;
    const baseDate = buildDate(dateKey);
    if (!baseDate) return null;

    const parts = String(timeValue).trim().split(' ');
    if (parts.length < 2) return null;
    const [timePart, meridiemRaw] = parts;
    const meridiem = meridiemRaw.toUpperCase();
    const [rawHours, rawMinutes] = timePart.split(':').map(Number);
    if (!Number.isFinite(rawHours) || !Number.isFinite(rawMinutes)) return null;

    let hours = rawHours % 12;
    if (meridiem === 'PM') hours += 12;
    baseDate.setHours(hours, rawMinutes, 0, 0);
    return baseDate;
  };

  const parseRange = (event) => {
    const dateKey = event.date;
    const startRaw = event.startTime ? String(event.startTime).trim() : '';
    const endRaw = event.endTime ? String(event.endTime).trim() : '';
    if (!dateKey || !startRaw) return { dateKey, start: null, end: null };

    const start = parseTimeOnDate(dateKey, startRaw);
    const end = endRaw ? parseTimeOnDate(dateKey, endRaw) : null;
    return {
      dateKey,
      start,
      end: end || (start ? new Date(start.getTime() + 60 * 60000) : null)
    };
  };

  const deriveCurrentSession = (events) => {
    const now = new Date();
    const todayKey = getLocalDateKey(now);
    for (const event of events) {
      const { dateKey, start, end } = parseRange(event);
      if (!start || !end || dateKey !== todayKey) continue;
      if (now >= start && now <= end) {
        return {
          currentSession: event.title,
          currentVenue: event.venue,
          mapUrl: event.locationUrl
        };
      }
    }
    return null;
  };

  // Polling for real-time updates every 5 seconds
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/live-hub');

        setUpdates(response.data.feed || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setUpdates([]);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchUpdates();

    // Set up polling interval
    const interval = setInterval(fetchUpdates, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schedule');
        setScheduleEvents(response.data || []);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setScheduleEvents([]);
      }
    };

    fetchSchedule();
  }, []);

  useEffect(() => {
    if (scheduleEvents.length === 0) {
      setCurrentSession(null);
      return undefined;
    }

    const updateCurrentSession = () => {
      setCurrentSession(deriveCurrentSession(scheduleEvents));
    };

    updateCurrentSession();
    const interval = setInterval(updateCurrentSession, 30000);

    return () => clearInterval(interval);
  }, [scheduleEvents]);

  const handleGetDirections = () => {
    const venue = currentSession?.currentVenue || '';
    const mapsUrl = currentSession?.mapUrl?.trim()
      || (venue
        ? `https://maps.google.com/?q=${encodeURIComponent(venue)}`
        : '');

    if (mapsUrl) {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className={styles.dashboard}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.appTitle}>EventFlow</h1>
            <button 
              className={styles.profileButton}
              onClick={() => {
                if (onLogout) {
                  onLogout();
                }
                navigate('/');
              }}
              aria-label="Log out"
            >
              <LogOut size={24} strokeWidth={2.5} />
              <span className={styles.logoutText}>Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Hero Card - Current Session */}
          {currentSession ? (
            <div className={styles.heroCard}>
              <div className={styles.heroHeader}>
                <Calendar className={styles.heroIcon} size={24} />
                <span className={styles.heroLabel}>Current Session</span>
              </div>

              <button
                type="button"
                className={styles.scheduleButton}
                onClick={() => navigate('/scheduler')}
              >
                View Schedule
              </button>
              
              <h2 className={styles.sessionTitle}>{currentSession.currentSession}</h2>
              
              <div className={styles.venueInfo}>
                <MapPin size={20} />
                <span className={styles.venueName}>
                  {currentSession.currentVenue
                    || currentSession.current_venue
                    || currentSession.venue}
                </span>
              </div>

              <button 
                className={styles.directionsButton}
                onClick={handleGetDirections}
              >
                <Navigation size={20} />
                <span>Get Directions</span>
              </button>
            </div>
          ) : (
            <div className={styles.heroCard}>
              <div className={styles.noSession}>
                <Calendar size={48} />
                <h3>No Active Session</h3>
                <p>Check back later for your schedule</p>
              </div>
            </div>
          )}

          {/* Live Feed Section */}
          <section className={styles.feedSection}>
            <div className={styles.feedHeader}>
              <h3 className={styles.feedTitle}>Live Updates</h3>
              <div className={styles.liveBadge}>
                <span className={styles.liveDot}></span>
                <span>Live</span>
              </div>
            </div>

            <div className={styles.feedList}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSkeleton}></div>
                  <div className={styles.loadingSkeleton}></div>
                  <div className={styles.loadingSkeleton}></div>
                </div>
              ) : updates.length === 0 ? (
                <div className={styles.emptyState}>
                  <Info size={48} />
                  <p>No updates yet</p>
                </div>
              ) : (
                updates.map((update, index) => (
                  <div 
                    key={index}
                    className={`${styles.updateCard} ${
                      update.is_urgent ? styles.urgentCard : ''
                    }`}
                  >
                    <div className={styles.updateHeader}>
                      <div className={styles.updateIcon}>
                        {update.is_urgent ? (
                          <AlertCircle size={20} />
                        ) : (
                          <Info size={20} />
                        )}
                      </div>
                      <span className={styles.updateTime}>
                        {formatTime(update.timestamp)}
                      </span>
                    </div>
                    <p className={styles.updateMessage}>{update.message}</p>
                    {update.title && (
                      <h4 className={styles.updateTitle}>{update.title}</h4>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>

    </>
  );
};

export default DashboardView;
