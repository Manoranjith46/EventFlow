import { useState } from 'react';
import { LogOut, Search, Plus, Trash2, CheckCircle, AlertCircle, Users } from 'lucide-react';
import axios from 'axios';
import styles from './DashBoard.module.css';

const VolunteerDashboard = ({ volunteer, onLogout }) => {
  const [activeTab, setActiveTab] = useState('check-in');

  // Check-In State
  const [regNo, setRegNo] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  // Announcements State
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState('General');
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);
  const [announcementError, setAnnouncementError] = useState('');

  // Schedule State
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleVenue, setScheduleVenue] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [scheduleOrder, setScheduleOrder] = useState('');
  const [scheduleCategory, setScheduleCategory] = useState('General');
  const [scheduleLocationUrl, setScheduleLocationUrl] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  // Participation State
  const [participantRegNo, setParticipantRegNo] = useState('');
  const [participantPassword, setParticipantPassword] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantsList, setParticipantsList] = useState([]);
  const [participationLoading, setParticipationLoading] = useState(false);
  const [participationSuccess, setParticipationSuccess] = useState(false);
  const [participationError, setParticipationError] = useState('');

  // Check-In Handler
  const handleVerify = async () => {
    if (!regNo.trim()) {
      setVerifyError('Please enter a Registration Number');
      return;
    }

    setVerifyLoading(true);
    setVerifyError('');
    setVerifySuccess(null);

    try {
      const response = await axios.patch('https://eventflow-dmku.onrender.com/api/verify', {
        regNo: regNo.trim(),
      });

      setVerifySuccess({
        name: response.data.name || 'User',
        regNo: response.data.regNo,
      });
      setRegNo('');
    } catch (error) {
      setVerifyError(
        error.response?.data?.message || 'Failed to verify participant'
      );
      setVerifySuccess(null);
    } finally {
      setVerifyLoading(false);
    }
  };

  // Announcements Handler
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();

    if (!announcementMessage.trim()) {
      setAnnouncementError('Please enter an announcement message');
      return;
    }

    setAnnouncementLoading(true);
    setAnnouncementError('');
    setAnnouncementSuccess(false);

    try {
      await axios.post('https://eventflow-dmku.onrender.com/api/admin/announcement', {
        message: announcementMessage.trim(),
        category: announcementCategory,
        timestamp: new Date(),
      });

      setAnnouncementSuccess(true);
      setAnnouncementMessage('');
      setAnnouncementCategory('General');
      setTimeout(() => setAnnouncementSuccess(false), 3000);
    } catch (error) {
      setAnnouncementError(
        error.response?.data?.message || 'Failed to post announcement'
      );
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handleClearAnnouncement = () => {
    setAnnouncementMessage('');
    setAnnouncementCategory('General');
    setAnnouncementError('');
    setAnnouncementSuccess(false);
  };

  // Schedule Handler
  const handleAddEvent = async (e) => {
    e.preventDefault();

    if (
      !scheduleTitle.trim() ||
      !scheduleVenue.trim() ||
      !scheduleDate.trim() ||
      !scheduleStartTime.trim() ||
      !scheduleEndTime.trim() ||
      !scheduleOrder.trim()
    ) {
      setScheduleError('Please fill in all required fields');
      return;
    }

    setScheduleLoading(true);
    setScheduleError('');
    setScheduleSuccess(false);

    try {
      await axios.post('https://eventflow-dmku.onrender.com/api/admin/schedule', {
        title: scheduleTitle.trim(),
        venue: scheduleVenue.trim(),
        date: scheduleDate,
        startTime: scheduleStartTime,
        endTime: scheduleEndTime,
        order: parseInt(scheduleOrder),
        category: scheduleCategory,
        locationUrl: scheduleLocationUrl.trim(),
      });

      setScheduleSuccess(true);
      setScheduleTitle('');
      setScheduleVenue('');
      setScheduleDate('');
      setScheduleStartTime('');
      setScheduleEndTime('');
      setScheduleOrder('');
      setScheduleCategory('General');
      setScheduleLocationUrl('');
      setTimeout(() => setScheduleSuccess(false), 3000);
    } catch (error) {
      setScheduleError(
        error.response?.data?.message || 'Failed to add event'
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleClearSchedule = () => {
    setScheduleTitle('');
    setScheduleVenue('');
    setScheduleDate('');
    setScheduleStartTime('');
    setScheduleEndTime('');
    setScheduleOrder('');
    setScheduleCategory('General');
    setScheduleLocationUrl('');
    setScheduleError('');
    setScheduleSuccess(false);
  };

  // Participation Handlers
  const handleAddParticipant = (e) => {
    e.preventDefault();

    if (
      !participantRegNo.trim() ||
      !participantPassword.trim() ||
      !participantName.trim()
    ) {
      setParticipationError('Please fill in all fields');
      return;
    }

    const newParticipant = {
      regNo: participantRegNo.trim(),
      password: participantPassword.trim(),
      name: participantName.trim(),
      isCheckedIn: true,
    };

    setParticipantsList([...participantsList, newParticipant]);
    setParticipantRegNo('');
    setParticipantPassword('');
    setParticipantName('');
    setParticipationError('');
  };

  const handleRemoveParticipant = (index) => {
    setParticipantsList(participantsList.filter((_, i) => i !== index));
  };

  const handleSubmitParticipants = async () => {
    if (participantsList.length === 0) {
      setParticipationError('Please add at least one participant');
      return;
    }

    setParticipationLoading(true);
    setParticipationError('');
    setParticipationSuccess(false);

    try {
      await axios.post('https://eventflow-dmku.onrender.com/api/admin/seed', participantsList);

      setParticipationSuccess(true);
      setParticipantsList([]);
      setTimeout(() => setParticipationSuccess(false), 3000);
    } catch (error) {
      setParticipationError(
        error.response?.data?.message || 'Failed to add participants'
      );
    } finally {
      setParticipationLoading(false);
    }
  };

  const handleClearParticipants = () => {
    setParticipantRegNo('');
    setParticipantPassword('');
    setParticipantName('');
    setParticipantsList([]);
    setParticipationError('');
    setParticipationSuccess(false);
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.appTitle}>EventFlow</h1>
          <div className={styles.headerRight}>
            <span className={styles.volunteerLabel}>Volunteer</span>
            <button
              className={styles.logoutButton}
              onClick={onLogout}
              aria-label="Log out"
            >
              <LogOut size={20} strokeWidth={2.5} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'check-in' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('check-in')}
        >
          Check-In
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'announcements' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'schedule' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'participation' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('participation')}
        >
          Participation
        </button>
      </nav>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Check-In Tab */}
        {activeTab === 'check-in' && (
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Participant Check-In</h2>
            <p className={styles.sectionSubtitle}>
              Search and verify participants at the event
            </p>

            <div className={styles.searchForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="regNo" className={styles.label}>
                  Registration Number (RegNo)
                </label>
                <div className={styles.inputWrapper}>
                  <Search className={styles.searchIcon} size={20} />
                  <input
                    id="regNo"
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="Enter participant registration number"
                    className={styles.input}
                    disabled={verifyLoading}
                  />
                </div>
              </div>

              {verifyError && (
                <div className={styles.errorAlert}>
                  <AlertCircle size={16} />
                  <span>{verifyError}</span>
                </div>
              )}

              {verifySuccess && (
                <div className={styles.successAlert}>
                  <CheckCircle size={16} />
                  <span>
                    {verifySuccess.name} ({verifySuccess.regNo}) verified and checked in!
                  </span>
                </div>
              )}

              <button
                className={styles.primaryButton}
                onClick={handleVerify}
                disabled={verifyLoading}
              >
                {verifyLoading ? 'Verifying...' : 'Verify Participant'}
              </button>
            </div>
          </section>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Post Announcement</h2>
            <p className={styles.sectionSubtitle}>
              Send real-time updates to all participants
            </p>

            <form className={styles.form} onSubmit={handlePostAnnouncement}>
              <div className={styles.inputGroup}>
                <label htmlFor="category" className={styles.label}>
                  Category
                </label>
                <select
                  id="category"
                  value={announcementCategory}
                  onChange={(e) => setAnnouncementCategory(e.target.value)}
                  className={styles.select}
                >
                  <option value="General">General</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Food">Food</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="message" className={styles.label}>
                  Message
                </label>
                <textarea
                  id="message"
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Type your announcement here..."
                  className={styles.textarea}
                  rows={6}
                  disabled={announcementLoading}
                />
              </div>

              {announcementError && (
                <div className={styles.errorAlert}>
                  <AlertCircle size={16} />
                  <span>{announcementError}</span>
                </div>
              )}

              {announcementSuccess && (
                <div className={styles.successAlert}>
                  <CheckCircle size={16} />
                  <span>Announcement posted successfully!</span>
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={announcementLoading}
                >
                  {announcementLoading ? 'Posting...' : 'Post Announcement'}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleClearAnnouncement}
                  disabled={announcementLoading}
                >
                  <Trash2 size={16} />
                  <span>Clear</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Event Schedule Management</h2>
            <p className={styles.sectionSubtitle}>
              Add and manage event timeline
            </p>

            <form className={styles.form} onSubmit={handleAddEvent}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="title" className={styles.label}>
                    Event Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    placeholder="e.g., Keynote Speech"
                    className={styles.input}
                    disabled={scheduleLoading}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="venue" className={styles.label}>
                    Venue *
                  </label>
                  <input
                    id="venue"
                    type="text"
                    value={scheduleVenue}
                    onChange={(e) => setScheduleVenue(e.target.value)}
                    placeholder="e.g., Auditorium"
                    className={styles.input}
                    disabled={scheduleLoading}
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="date" className={styles.label}>
                    Date *
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className={styles.input}
                    disabled={scheduleLoading}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="order" className={styles.label}>
                    Order *
                  </label>
                  <input
                    id="order"
                    type="number"
                    value={scheduleOrder}
                    onChange={(e) => setScheduleOrder(e.target.value)}
                    placeholder="e.g., 1"
                    className={styles.input}
                    disabled={scheduleLoading}
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="startTime" className={styles.label}>
                    Start Time *
                  </label>
                  <input
                    id="startTime"
                    type="text"
                    value={scheduleStartTime}
                    onChange={(e) => setScheduleStartTime(e.target.value)}
                    placeholder="e.g., 10:00 AM"
                    className={styles.input}
                    disabled={scheduleLoading}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="endTime" className={styles.label}>
                    End Time *
                  </label>
                  <input
                    id="endTime"
                    type="text"
                    value={scheduleEndTime}
                    onChange={(e) => setScheduleEndTime(e.target.value)}
                    placeholder="e.g., 11:00 AM"
                    className={styles.input}
                    disabled={scheduleLoading}
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="category" className={styles.label}>
                    Category
                  </label>
                  <select
                    id="category"
                    value={scheduleCategory}
                    onChange={(e) => setScheduleCategory(e.target.value)}
                    className={styles.select}
                    disabled={scheduleLoading}
                  >
                    <option value="General">General</option>
                    <option value="Tech">Tech</option>
                    <option value="Food">Food</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="locationUrl" className={styles.label}>
                    Location URL
                  </label>
                  <input
                    id="locationUrl"
                    type="url"
                    value={scheduleLocationUrl}
                    onChange={(e) => setScheduleLocationUrl(e.target.value)}
                    placeholder="Google Maps link"
                    className={styles.input}
                    disabled={scheduleLoading}
                  />
                </div>
              </div>

              {scheduleError && (
                <div className={styles.errorAlert}>
                  <AlertCircle size={16} />
                  <span>{scheduleError}</span>
                </div>
              )}

              {scheduleSuccess && (
                <div className={styles.successAlert}>
                  <CheckCircle size={16} />
                  <span>Event added to schedule successfully!</span>
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={scheduleLoading}
                >
                  <Plus size={16} />
                  <span>{scheduleLoading ? 'Adding...' : 'Add Event'}</span>
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleClearSchedule}
                  disabled={scheduleLoading}
                >
                  <Trash2 size={16} />
                  <span>Clear</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Participation Tab */}
        {activeTab === 'participation' && (
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Add Participants</h2>
            <p className={styles.sectionSubtitle}>
              Register participants for the event
            </p>

            <form className={styles.form} onSubmit={handleAddParticipant}>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="participantRegNo" className={styles.label}>
                    Registration Number (RegNo) *
                  </label>
                  <input
                    id="participantRegNo"
                    type="text"
                    value={participantRegNo}
                    onChange={(e) => setParticipantRegNo(e.target.value)}
                    placeholder="e.g., REG123"
                    className={styles.input}
                    disabled={participationLoading}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="participantPassword" className={styles.label}>
                    Password *
                  </label>
                  <input
                    id="participantPassword"
                    type="password"
                    value={participantPassword}
                    onChange={(e) => setParticipantPassword(e.target.value)}
                    placeholder="Set a password"
                    className={styles.input}
                    disabled={participationLoading}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="participantName" className={styles.label}>
                  Full Name *
                </label>
                <input
                  id="participantName"
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className={styles.input}
                  disabled={participationLoading}
                />
              </div>

              {participationError && (
                <div className={styles.errorAlert}>
                  <AlertCircle size={16} />
                  <span>{participationError}</span>
                </div>
              )}

              {participationSuccess && (
                <div className={styles.successAlert}>
                  <CheckCircle size={16} />
                  <span>Participants added successfully!</span>
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={participationLoading}
                >
                  <Plus size={16} />
                  <span>Add to List</span>
                </button>
              </div>
            </form>

            {/* Participants List */}
            {participantsList.length > 0 && (
              <div className={styles.participantsList}>
                <h3 className={styles.listTitle}>
                  <Users size={18} />
                  Participants to Add ({participantsList.length})
                </h3>
                <div className={styles.listItems}>
                  {participantsList.map((participant, index) => (
                    <div key={index} className={styles.listItem}>
                      <div className={styles.listItemInfo}>
                        <div className={styles.listItemName}>{participant.name}</div>
                        <div className={styles.listItemMeta}>
                          RegNo: {participant.regNo}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => handleRemoveParticipant(index)}
                        aria-label="Remove participant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleSubmitParticipants}
                    disabled={participationLoading}
                  >
                    <CheckCircle size={16} />
                    <span>
                      {participationLoading
                        ? 'Submitting...'
                        : `Submit ${participantsList.length} Participant${participantsList.length !== 1 ? 's' : ''}`}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleClearParticipants}
                    disabled={participationLoading}
                  >
                    <Trash2 size={16} />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default VolunteerDashboard;
