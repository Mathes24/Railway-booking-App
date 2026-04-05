const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { sendBookingConfirmation, sendDelayAlert, sendRefundAlert } = require('./src/services/notificationService');
const { getRecommendations } = require('./src/services/recommendationEngine');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

let db;
let liveStatuses = {};

function simulateTrainMovements() {
    Object.keys(liveStatuses).forEach(async id => {
        const rand = Math.random();
        const prevDelay = liveStatuses[id].delay;

        if (rand < 0.3) {
            liveStatuses[id].delay += Math.floor(Math.random() * 5) + 1;
            liveStatuses[id].message = `Delayed by ${liveStatuses[id].delay} mins`;
        } else if (rand > 0.8) {
            const recovery = Math.floor(Math.random() * 5);
            liveStatuses[id].delay = Math.max(0, liveStatuses[id].delay - recovery);
            liveStatuses[id].message = liveStatuses[id].delay > 0 ? `Delayed by ${liveStatuses[id].delay} mins` : 'On Time';
        } else {
            if (liveStatuses[id].delay === 0) liveStatuses[id].message = 'On Time';
        }

        if (liveStatuses[id].delay > prevDelay && liveStatuses[id].delay >= 15 && prevDelay < 15) {
            if (db) {
                const trainDetails = await db.get('SELECT * FROM Trains WHERE id = ?', [id]);
                const users = await db.all(`
                    SELECT DISTINCT u.email 
                    FROM Users u 
                    JOIN Tickets t ON u.id = t.userId 
                    WHERE t.trainId = ?
                `, [id]);
                users.forEach(u => sendDelayAlert(u.email, trainDetails, liveStatuses[id].delay));
            }
        }
    });
}

async function startServer() {
    const dbPath = process.env.DB_PATH || './database.sqlite';
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user'
        );
        CREATE TABLE IF NOT EXISTS Trains (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            source TEXT,
            destination TEXT,
            date TEXT,
            time TEXT,
            totalSeats INTEGER,
            price REAL
        );
        CREATE TABLE IF NOT EXISTS Tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            trainId INTEGER,
            seatsBooked INTEGER,
            totalPrice REAL,
            bookingDate TEXT
        );
        CREATE TABLE IF NOT EXISTS TicketPassengers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticketId INTEGER,
            name TEXT,
            age INTEGER,
            seatNumber TEXT
        );
        CREATE TABLE IF NOT EXISTS BookedSeats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trainId INTEGER,
            seatNumber TEXT
        );
    `);

    // Safely migrate existing Tickets table to add payment info
    try { await db.exec('ALTER TABLE Tickets ADD COLUMN paymentMethod TEXT DEFAULT "None"'); } catch(e){}
    try { await db.exec('ALTER TABLE Tickets ADD COLUMN transactionId TEXT'); } catch(e){}
    try { await db.exec('ALTER TABLE Tickets ADD COLUMN status TEXT DEFAULT "Confirmed"'); } catch(e){}

    // Create Admin
    const admin = await db.get('SELECT * FROM Users WHERE email = ?', ['admin@railway.com']);
    if (!admin) {
        await db.run('INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@railway.com', 'admin', 'admin']);
    }

    // Seed Trains
    const trainsCount = await db.get('SELECT COUNT(*) as count FROM Trains');
    if (trainsCount.count === 0) {
        await db.run(`INSERT INTO Trains (name, source, destination, date, time, totalSeats, price) VALUES 
            ('Rajdhani Express', 'New Delhi', 'Mumbai', '2026-04-10', '16:00 PM', 72, 2500),
            ('Shatabdi Express', 'Chennai', 'Bengaluru', '2026-04-10', '06:00 AM', 72, 1200),
            ('Vande Bharat', 'Varanasi', 'New Delhi', '2026-04-11', '15:00 PM', 72, 1800)`);
    } else {
        await db.run('UPDATE Trains SET totalSeats = 72');
        await db.run(`UPDATE Trains SET name = 'Rajdhani Express', source = 'New Delhi', destination = 'Mumbai', price = 2500 WHERE id = 1`);
        await db.run(`UPDATE Trains SET name = 'Shatabdi Express', source = 'Chennai', destination = 'Bengaluru', price = 1200 WHERE id = 2`);
        await db.run(`UPDATE Trains SET name = 'Vande Bharat', source = 'Varanasi', destination = 'New Delhi', price = 1800 WHERE id = 3`);
        
        const currentCount = await db.get('SELECT COUNT(*) as count FROM Trains');
        if (currentCount.count < 8) {
             await db.run(`INSERT INTO Trains (name, source, destination, date, time, totalSeats, price) VALUES 
                ('Duronto Express', 'Kolkata', 'New Delhi', '2026-04-12', '08:30 AM', 72, 2200),
                ('Garib Rath', 'Mumbai', 'Delhi', '2026-04-12', '14:00 PM', 72, 800),
                ('Tejas Express', 'Lucknow', 'New Delhi', '2026-04-13', '06:10 AM', 72, 1500),
                ('Coromandel Express', 'Howrah', 'Chennai', '2026-04-13', '15:20 PM', 72, 1900),
                ('Sampark Kranti', 'Bengaluru', 'New Delhi', '2026-04-14', '13:50 PM', 72, 2100)`);
        }
    }

    const allTrains = await db.all('SELECT id FROM Trains');
    allTrains.forEach(t => { liveStatuses[t.id] = { delay: 0, message: 'On Time' }; });
    setInterval(simulateTrainMovements, 5000);

    app.listen(PORT, () => console.log(`Server is running with SQLite on http://localhost:${PORT}`));
}

startServer();

// --- API Endpoints ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const result = await db.run('INSERT INTO Users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
        res.json({ success: true, user: { id: result.lastID, name, email, role: 'user' } });
    } catch(e) {
        res.status(400).json({ error: "Email already registered" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM Users WHERE email = ? AND password = ?', [email, password]);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/trains/search', async (req, res) => {
    const { source, destination, date } = req.query;
    let query = "SELECT * FROM Trains WHERE 1=1";
    let params = [];
    if (source) { query += " AND LOWER(source) LIKE ?"; params.push(`%${source.toLowerCase()}%`); }
    if (destination) { query += " AND LOWER(destination) LIKE ?"; params.push(`%${destination.toLowerCase()}%`); }
    if (date) { query += " AND date = ?"; params.push(date); }

    const trains = await db.all(query, params);
    
    // Annotate with available seats dynamically
    for (let t of trains) {
        const booked = await db.get('SELECT COUNT(*) as c FROM BookedSeats WHERE trainId = ?', [t.id]);
        t.seatsAvailable = t.totalSeats - booked.c;
        t.liveStatus = liveStatuses[t.id] || { delay: 0, message: 'On Time' };
    }
    res.json({ success: true, count: trains.length, data: trains });
});

app.get('/api/trains/:id', async (req, res) => {
    const train = await db.get('SELECT * FROM Trains WHERE id = ?', [req.params.id]);
    if (!train) return res.status(404).json({ error: "Train not found" });
    const booked = await db.all('SELECT seatNumber FROM BookedSeats WHERE trainId = ?', [train.id]);
    train.seatsAvailable = train.totalSeats - booked.length;
    train.bookedSeats = booked.map(b => b.seatNumber);
    train.liveStatus = liveStatuses[train.id] || { delay: 0, message: 'On Time' };
    res.json({ success: true, data: train });
});

app.post('/api/bookings', async (req, res) => {
    const { userId, trainId, seatsBooked, selectedSeats, passengers, paymentMethod, transactionId } = req.body;
    
    // Minimal validation
    if (!userId || !trainId || !selectedSeats || !passengers) return res.status(400).json({ error: "Invalid booking inputs" });

    const train = await db.get('SELECT * FROM Trains WHERE id = ?', [trainId]);
    if (!train) return res.status(404).json({ error: "Train not found" });

    const totalPrice = train.price * seatsBooked;
    const date = new Date().toISOString();

    try {
        await db.run('BEGIN TRANSACTION');
        
        // Double check seats aren't booked
        for (let seat of selectedSeats) {
            const isBooked = await db.get('SELECT * FROM BookedSeats WHERE trainId = ? AND seatNumber = ?', [trainId, seat]);
            if (isBooked) throw new Error(`Seat ${seat} is already booked!`);
        }

        const tResult = await db.run(
            'INSERT INTO Tickets (userId, trainId, seatsBooked, totalPrice, bookingDate, paymentMethod, transactionId) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [userId, trainId, seatsBooked, totalPrice, date, paymentMethod || 'None', transactionId || '']
        );
        const ticketId = tResult.lastID;

        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i];
            const seat = selectedSeats[i];
            await db.run('INSERT INTO TicketPassengers (ticketId, name, age, seatNumber) VALUES (?, ?, ?, ?)', [ticketId, p.name, p.age, seat]);
            await db.run('INSERT INTO BookedSeats (trainId, seatNumber) VALUES (?, ?)', [trainId, seat]);
        }

        await db.run('COMMIT');

        const userObj = await db.get('SELECT name, email FROM Users WHERE id = ?', [userId]);
        const ticketObj = { seatsBooked, totalPrice, paymentMethod: paymentMethod || 'None', transactionId: transactionId || '' };
        if (userObj) sendBookingConfirmation(userObj, train, ticketObj);

        res.json({ success: true, ticketId });
    } catch (e) {
        await db.run('ROLLBACK');
        res.status(400).json({ error: e.message });
    }
});

app.get('/api/tickets/:userId', async (req, res) => {
    const tickets = await db.all('SELECT * FROM Tickets WHERE userId = ? ORDER BY id DESC', [req.params.userId]);
    for (let t of tickets) {
        t.trainDetails = await db.get('SELECT * FROM Trains WHERE id = ?', [t.trainId]);
        t.passengers = await db.all('SELECT * FROM TicketPassengers WHERE ticketId = ?', [t.id]);
    }
    res.json({ success: true, data: tickets });
});

app.post('/api/tickets/:id/cancel', async (req, res) => {
    const { userId } = req.body;
    const ticketId = req.params.id;

    if (!userId) return res.status(400).json({ error: "User ID required" });

    try {
        await db.run('BEGIN TRANSACTION');
        
        const ticket = await db.get('SELECT * FROM Tickets WHERE id = ? AND userId = ?', [ticketId, userId]);
        if (!ticket) throw new Error("Ticket not found or unauthorized");
        if (ticket.status === 'Cancelled') throw new Error("Ticket is already cancelled");

        const user = await db.get('SELECT email, name FROM Users WHERE id = ?', [userId]);
        const train = await db.get('SELECT * FROM Trains WHERE id = ?', [ticket.trainId]);

        const seats = await db.all('SELECT seatNumber FROM TicketPassengers WHERE ticketId = ?', [ticketId]);
        for (let s of seats) {
            await db.run('DELETE FROM BookedSeats WHERE trainId = ? AND seatNumber = ?', [ticket.trainId, s.seatNumber]);
        }

        await db.run("UPDATE Tickets SET status = 'Cancelled' WHERE id = ?", [ticketId]);

        await db.run('COMMIT');

        if (user && train) {
             sendRefundAlert(user.email, ticket, train);
        }

        res.json({ success: true, message: "Ticket successfully cancelled" });
    } catch (e) {
        await db.run('ROLLBACK');
        res.status(400).json({ error: e.message });
    }
});

// Admin stats
app.get('/api/admin/stats', async (req, res) => {
    const stats = {
        users: (await db.get('SELECT COUNT(*) as c FROM Users')).c,
        tickets: (await db.get('SELECT COUNT(*) as c FROM Tickets')).c,
        revenue: (await db.get("SELECT SUM(totalPrice) as r FROM Tickets WHERE status != 'Cancelled'")).r || 0,
        trains: (await db.get('SELECT COUNT(*) as c FROM Trains')).c
    };
    res.json({ success: true, data: stats });
});

app.get('/api/admin/trains', async (req, res) => {
    const trains = await db.all('SELECT * FROM Trains ORDER BY id DESC');
    for (const t of trains) {
        t.liveStatus = liveStatuses[t.id] || { delay: 0, message: 'On Time' };
    }
    res.json({ success: true, data: trains });
});

app.post('/api/admin/trains', async (req, res) => {
    const { name, source, destination, date, time, totalSeats, price } = req.body;
    try {
        const result = await db.run(
            'INSERT INTO Trains (name, source, destination, date, time, totalSeats, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, source, destination, date, time, totalSeats || 72, price]
        );
        const trainId = result.lastID;
        liveStatuses[trainId] = { delay: 0, message: 'On Time' };
        res.json({ success: true, trainId });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.get('/api/admin/bookings', async (req, res) => {
    const bookings = await db.all(`
        SELECT t.*, u.name as userName, u.email as userEmail, tr.name as trainName
        FROM Tickets t
        JOIN Users u ON t.userId = u.id
        JOIN Trains tr ON t.trainId = tr.id
        ORDER BY t.bookingDate DESC
    `);
    res.json({ success: true, data: bookings });
});

// AI Recommendations
app.get('/api/trains/recommendations/:userId', async (req, res) => {
    try {
        const recommendations = await getRecommendations(db, req.params.userId, liveStatuses);
        res.json({ success: true, data: recommendations });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Catch-all route for SPA client-side routing (Express 5/Node 24 compatibility)
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('SPA Fallback Error (index.html not found!):', err);
            res.status(404).send('Error: Could not find application build. Please rebuild using npm run build.');
        }
    });
});
