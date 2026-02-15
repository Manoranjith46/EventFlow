import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import styles from './Scheduler.module.css';


const ScheduleList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const buildDate = (dateKey) => {
        const [year, month, day] = dateKey.split('-').map(Number);
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
        if (!dateKey || !startRaw) return { dateKey, start: null, end: null, hasEnd: false };

        const start = parseTimeOnDate(dateKey, startRaw);
        const end = endRaw ? parseTimeOnDate(dateKey, endRaw) : null;
        return {
            dateKey,
            start,
            end: end || (start ? new Date(start.getTime() + 60 * 60000) : null),
            hasEnd: Boolean(endRaw)
        };
    };

    const formatTimeRange = (start, end, hasEnd) => {
        if (!start) return '';
        const startLabel = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        if (!end || !hasEnd) return startLabel;
        const endLabel = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `${startLabel} - ${endLabel}`;
    };

    const getDelayMinutes = (event) => {
        const value = event.delayMinutes ?? event.delay ?? event.delay_minutes ?? 0;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await axios.get('https://eventflow-dmku.onrender.com/api/schedule');
                setEvents(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching schedule:", err);
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    if (loading) {
        return <div className={styles.container}>Loading Timeline...</div>;
    }

    if (events.length === 0) {
        return null; // Don't show anything if schedule is empty
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.headerRow}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => window.history.back()}
                    aria-label="Back to dashboard"
                >
                    <ArrowLeft size={18} />
                </button>
                <h3 className={styles.header}>
                    <Calendar size={20} color="#2563eb" /> Event Timeline
                </h3>
            </div>
            
            {/* List of Cards */}
            <div className={styles.list}>
                {(() => {
                    const now = new Date();
                    const todayKey = now.toISOString().slice(0, 10);
                    const parsedEvents = events.map((event) => ({
                        event,
                        ...parseRange(event)
                    }));

                    const ongoingIndex = parsedEvents.findIndex((item) => {
                        if (!item.start || !item.end || item.dateKey !== todayKey) return false;
                        return now >= item.start && now <= item.end;
                    });

                    const ongoingDate = ongoingIndex >= 0 ? parsedEvents[ongoingIndex].dateKey : null;
                    const upcomingOnDate = ongoingIndex >= 0
                        ? parsedEvents.filter((item, index) => index > ongoingIndex && item.dateKey === ongoingDate)
                        : [];
                    const delayMinutes = ongoingIndex >= 0 ? getDelayMinutes(parsedEvents[ongoingIndex].event) : 0;
                    const perEventAdjust = upcomingOnDate.length > 0 ? delayMinutes / upcomingOnDate.length : 0;

                    return parsedEvents.map((item, index) => {
                        const { event, start, end, hasEnd, dateKey } = item;
                        const isSameDate = dateKey === todayKey;
                        const isFinished = start && end && (now > end) && isSameDate;
                        const isOngoing = start && end && (now >= start && now <= end) && isSameDate;
                        const isUpcoming = start && end && (now < start) && isSameDate;
                        const statusClass = isOngoing
                            ? styles.statusOngoing
                            : isFinished
                                ? styles.statusFinished
                                : styles.statusUpcoming;

                        const adjustedStart = (perEventAdjust && index > ongoingIndex && dateKey === ongoingDate && start)
                            ? new Date(start.getTime() + perEventAdjust * 60000)
                            : start;
                        const adjustedEnd = (perEventAdjust && index > ongoingIndex && dateKey === ongoingDate && end)
                            ? new Date(end.getTime() + perEventAdjust * 60000)
                            : end;
                        const displayTime = adjustedStart
                            ? formatTimeRange(adjustedStart, adjustedEnd, hasEnd)
                            : `${event.startTime || ''}${event.endTime ? ` - ${event.endTime}` : ''}`.trim();

                        // Determine the specific class based on category
                        let categoryClass = styles.typeGeneral;
                        if (event.category === 'Tech') categoryClass = styles.typeTech;
                        if (event.category === 'Food') categoryClass = styles.typeFood;
                        if (event.category === 'Urgent') categoryClass = styles.typeUrgent;

                        return (
                            <div key={event._id} className={`${styles.card} ${categoryClass} ${statusClass}`}>
                            
                            {/* Top Row: Title + Time */}
                            <div className={styles.topRow}>
                                <span className={styles.title}>{event.title}</span>
                                <span className={styles.time}>
                                    <Clock size={12} /> {displayTime}
                                </span>
                            </div>

                            {/* Bottom Row: Venue */}
                            <div className={styles.venue}>
                                <MapPin size={14} color="#64748b" />
                                {event.locationUrl ? (
                                    <a
                                        href={event.locationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.venueLink}
                                    >
                                        {event.venue}
                                    </a>
                                ) : (
                                    <span>{event.venue}</span>
                                )}
                            </div>
                        </div>
                        );
                    });
                })()}
            </div>
        </div>
    );
};

export default ScheduleList;