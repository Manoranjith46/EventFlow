import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';
import styles from './WaitingView.module.css';

const WaitingView = ({ participant, onUpdate }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');

    try {
      const regNo = participant.regNo || participant.registration_number;
      const response = await axios.get(`https://eventflow-dmku.onrender.com/api/user/${regNo}`);

      const updatedData = {
        ...response.data,
        registration_number: response.data.regNo,
        is_checked_in: response.data.isCheckedIn,
      };

      if (onUpdate) {
        onUpdate(updatedData);
      }

      if (response.data.isCheckedIn) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Failed to refresh status');
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className={styles.waitingContainer}>
      <div className={styles.content}>
        {/* Pulsing Shield Icon */}
        <div className={styles.iconWrapper}>
          <ShieldCheck className={styles.icon} size={120} strokeWidth={2} />
          <div className={styles.pulseRing}></div>
          <div className={styles.pulseRing} style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Main Message */}
        <div className={styles.messageSection}>
          <h1 className={styles.title}>Verification Pending</h1>
          <p className={styles.subtitle}>
            Show this screen to a volunteer
          </p>
        </div>

        {/* User Info Card */}
        <div className={styles.userCard}>
          <div className={styles.userInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name</span>
              <span className={styles.value}>{participant.name || 'Participant'}</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Registration No.</span>
              <span className={styles.value}>{participant.regNo || participant.registration_number}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={styles.statusBadge}>
          <div className={styles.statusDot}></div>
          <span>Awaiting Check-in</span>
        </div>

        {/* Instructions */}
        <div className={styles.instructions}>
          <p>
            A volunteer will verify your identity and check you in.
            Please keep this screen visible.
          </p>
        </div>

        {/* Refresh Button */}
        <button
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={20}
            className={refreshing ? styles.spinning : ''}
          />
          {refreshing ? 'Checking...' : 'Refresh Status'}
        </button>

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
};

export default WaitingView;
