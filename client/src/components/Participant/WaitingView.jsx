import { ShieldCheck } from 'lucide-react';
import styles from './WaitingView.module.css';

const WaitingView = ({ participant }) => {
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
      </div>
    </div>
  );
};

export default WaitingView;
