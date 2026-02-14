import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // DNS Bypass

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. DATA MODELS ---

// UPDATED: User now has a 'password' field
const User = mongoose.model('User', new mongoose.Schema({
    regNo: { type: String, unique: true, required: true }, // Usage: Temp ID
    password: { type: String, required: true },            // Usage: Password
    name: String,
    isCheckedIn: { type: Boolean, default: false }
}));

const Update = mongoose.model('Update', new mongoose.Schema({
    message: String,
    category: { type: String, default: 'General' }, 
    timestamp: { type: Date, default: Date.now }
}));

const Status = mongoose.model('Status', new mongoose.Schema({
    currentSession: { type: String, default: "Registration" },
    currentVenue: { type: String, default: "Main Entrance" },
    mapUrl: { type: String, default: "" }
}));

const ScheduleSchema = new mongoose.Schema({
    order: Number,        // To keep them in 1, 2, 3 order
    date: String,         // e.g., "2026-02-14"
    startTime: String,    // e.g., "10:00 AM"
    endTime: String,      // e.g., "11:00 AM"
    title: String,        // e.g., "Inauguration"
    venue: String,        // e.g., "Auditorium"
    category: String,     // e.g., "Tech", "Food", "General"
    locationUrl: String   // e.g., Google Maps link
});

const Schedule = mongoose.model('Schedule', ScheduleSchema);

// --- 2. ROUTES ---

// [NEW] Login Route (ID + Password)
app.post('/api/login', async (req, res) => {
    try {
        const { regNo, password } = req.body;
        // Find user by ID
        const user = await User.findOne({ regNo });
        
        // Check if user exists AND password matches
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid ID or Password" });
        }
        
        // Return user info if success
        res.json(user);
    } catch (err) { res.status(500).json(err); }
});

// [PARTICIPANT] Get Profile (Optional, if needed after login)
app.get('/api/user/:regNo', async (req, res) => {
    try {
        const user = await User.findOne({ regNo: req.params.regNo });
        if (!user) return res.status(404).json({ message: "Not Registered" });
        res.json(user);
    } catch (err) { res.status(500).json(err); }
});

// [VOLUNTEER] Verify Participant
app.patch('/api/verify', async (req, res) => {
    try {
        const { regNo } = req.body;
        
        console.log(`[VERIFY] Attempting to verify regNo: "${regNo}"`);
        
        // Find and update
        const user = await User.findOneAndUpdate(
            { regNo }, 
            { isCheckedIn: true }, 
            { returnDocument: 'after' } // Updated syntax
        );

        // CHECK: If user is null, they don't exist!
        if (!user) {
            console.log(`[VERIFY] User not found for regNo: "${regNo}"`);
            return res.status(404).json({ message: "User not found!" });
        }
        
        console.log(`[VERIFY] Successfully verified user:`, user);
        res.json(user);
    } catch (err) { 
        console.error(`[VERIFY] Error:`, err);
        res.status(500).json(err); 
    }
});

// [PARTICIPANT] Live Hub Polling
app.get('/api/live-hub', async (req, res) => {
    try {
        const feed = await Update.find().sort({ timestamp: -1 }).limit(5);
        const eventStatus = await Status.findOne() || { currentSession: "TBD", currentVenue: "TBD" };
        res.json({ feed, eventStatus });
    } catch (err) { res.status(500).json(err); }
});

// --- SCHEDULE ROUTES ---

// [PARTICIPANT] Get the Full Schedule (Sorted by Order)
app.get('/api/schedule', async (req, res) => {
    try {
        const schedule = await Schedule.find().sort({ order: 1 });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// [ADMIN] Change Venue/Session
app.post('/api/admin/set-status', async (req, res) => {
    try {
        const status = await Status.findOneAndUpdate({}, req.body, { upsert: true, returnDocument: 'after' });
        res.json(status);
    } catch (err) { res.status(500).json(err); }
});

// [ADMIN] Push Announcement
app.post('/api/admin/announcement', async (req, res) => {
    try {
        const announcement = await Update.create(req.body);
        res.json(announcement);
    } catch (err) { res.status(500).json(err); }
});

// [ADMIN] Seed Users - Helper to create users with passwords quickly
app.post('/api/admin/seed', async (req, res) => {
    try {
        // Expects body: [{ regNo: "123", password: "pass", name: "John" }]
        await User.insertMany(req.body); 
        res.json({ message: "Users Created" });
    } catch (err) { res.status(500).json(err); }
});

// [ADMIN] Seed Users - Add a Single Event (For Admin Panel)
app.post('/api/admin/schedule', async (req, res) => {
    try {
        const newEvent = await Schedule.create(req.body);
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// [ADMIN] Seed Users - Reset/Seed Schedule (For Hackathon Demo)
app.post('/api/admin/schedule/seed', async (req, res) => {
    try {
        await Schedule.deleteMany({}); // Clear old data first
        const events = await Schedule.insertMany(req.body);
        res.json({ message: "Schedule Created!", count: events.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- 3. DATABASE & START ---
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
const PORT = 5000;

mongoose.connect(MONGO_URI, { family: 4 })
    .then(() => {
        console.log("✅ MongoDB Connected (Login Enabled)");
        app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
    })
    .catch(err => console.log("❌ DB Connection Error:", err.message));