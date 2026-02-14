import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader } from 'lucide-react';
import styles from './LoginView.module.css';

const LoginView = ({ onLogin, onVolunteerLogin }) => {
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShake(false);
    
    if (!regNo.trim() || !password.trim()) {
      setError('Please fill in all fields');
      triggerShake();
      return;
    }

    setLoading(true);

    // Check for volunteer login
    if (onVolunteerLogin && onVolunteerLogin(regNo, password)) {
      navigate('/volunteer-dashboard');
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regNo: regNo,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setError('Invalid credentials. Please try again.');
        triggerShake();
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Successful login - map backend response to frontend format
      const mappedData = {
        ...data,
        registration_number: data.regNo,
        is_checked_in: data.isCheckedIn,
      };

      onLogin(mappedData);
      navigate(data.isCheckedIn ? '/dashboard' : '/waiting');
    } catch (err) {
      setError(err.message || 'Unable to connect to server');
      triggerShake();
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginContent}>
        {/* Logo/Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <LogIn size={48} strokeWidth={2.5} />
          </div>
          <h1 className={styles.title}>EventFlow</h1>
          <p className={styles.subtitle}>Real-time Hackathon Navigation</p>
        </div>

        {/* Login Form */}
        <form 
          className={`${styles.form} ${shake ? styles.shake : ''}`}
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}

          {/* Registration Number Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="regNo" className={styles.label}>
              Registration Number
            </label>
            <input
              id="regNo"
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              placeholder="Enter your registration number"
              className={styles.input}
              disabled={loading}
              autoComplete="username"
              required
            />
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={styles.input}
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className={styles.spinner} size={20} />
                <span>Joining Event...</span>
              </>
            ) : (
              <span>Join Event</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            First time? Register at the help desk
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;