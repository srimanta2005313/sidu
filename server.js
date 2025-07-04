const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 5001;

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: 3306, // Correct: "port" should be lowercase
    password: "SRIMANTA@2005",
    database: "Hotel"
});

db.connect(err => {
    if (err) {
        console.error("Database connection error:", err);
        return;
    }
    console.log("Connected to MySQL Database.");
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' folder if needed
app.use(express.static(path.join(__dirname, 'public')));

// Serve the login page at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landingpage.html'));
});

// Signup Route
app.post('/signup', async (req, res) => {
    const { userId, password, name } = req.body;

    if (!userId || !password || !name) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (userId, password, name, userType) VALUES (?, ?, ?, 'User')`;

        db.query(query, [userId, hashedPassword, name], (err) => {
            if (err) {
                console.error("Database error during signup:", err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.json({ success: true, message: 'Signup successful!' });
        });
    } catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { userId, password, userType } = req.body;

    console.log("Received Login Request:", { userId, userType });

    const query = `SELECT * FROM users WHERE userId = ?`;
    db.query(query, [userId], async (err, results) => {
        if (err) {
            console.error('Database error during login:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        console.log("Database Query Result:", results);

        if (results.length > 0) {
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                return res.json({ success: true, message: `${userType} login successful` });
            } else {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the 'uploads' directory exists in your project root
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Route: Store Booking Data in Database
app.post('/book-room', upload.single('receipt'), (req, res) => {
    const { userId, name, phone, email, roomType, price, date, paymentType, transactionId } = req.body;
    const receipt = req.file ? req.file.filename : null;

    if (!userId || !name || !phone || !email || !roomType || !price || !date || !paymentType || !transactionId || !receipt) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if the transaction ID already exists
    const checkSql = 'SELECT * FROM bookings WHERE transaction_id = ?';
    db.query(checkSql, [transactionId], (err, results) => {
        if (err) {
            console.error('Database error during booking check:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Transaction ID already used. Please enter a unique Transaction ID.' });
        }

        // Insert new booking if transaction_id is unique
        const sql = 'INSERT INTO bookings (user_id, name, phone, email, room_type, price, booking_date, payment_type, transaction_id, receipt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [userId, name, phone, email, roomType, price, date, paymentType, transactionId, receipt], (err, result) => {
            if (err) {
                console.error('Database error during booking insertion:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.json({ success: true, message: 'Booking successful!' });
        });
    });
});

// Route: Place a Food Order
app.post('/place-order', (req, res) => {
    const { userId, roomNumber, cart } = req.body;

    if (!userId || !roomNumber || !cart || cart.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid order request. Ensure all fields are filled.' });
    }

    const sql = 'INSERT INTO food_orders (user_id, room_number, item_name, price, order_time) VALUES ?';

    const orderValues = cart.map(item => [userId, roomNumber, item.item, item.price, new Date()]);

    db.query(sql, [orderValues], (err, result) => {
        if (err) {
            console.error("Database error while placing order:", err);
            return res.status(500).json({ success: false, message: 'Database error while placing order' });
        }

        console.log("Order placed successfully!");
        res.json({ success: true, message: 'Order placed successfully!' });
    });
});

// Route: Retrieve Bookings for a Specific User
app.get('/get-bookings/:userId', (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const sql = 'SELECT user_id, name, email, phone, room_type, price, booking_date, payment_type FROM bookings WHERE user_id = ? ORDER BY booking_date DESC';

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Database error retrieving bookings:", err);
            return res.status(500).json({ success: false, message: 'Error retrieving bookings' });
        }

        if (!results || results.length === 0) {
            console.warn("No bookings found for user:", userId);
            return res.json({ success: true, message: 'No bookings found', bookings: [] });
        }

        console.log("Retrieved Bookings for User:", userId, results);
        res.json({ success: true, bookings: results });
    });
});

app.get('/get-orders/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = 'SELECT room_number, item_name, price, order_time FROM food_orders WHERE user_id = ? ORDER BY order_time DESC';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error retrieving orders' });
        }
        res.json({ success: true, orders: results });
    });
});

// Route: Retrieve All Bookings
app.get('/get-all-bookings', (req, res) => {
    const sql = 'SELECT id, name, email, phone, room_type, price, booking_date, payment_type FROM bookings';

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error retrieving bookings:", err);
            return res.status(500).json({ success: false, message: 'Error retrieving bookings' });
        }

        if (!results || results.length === 0) {
            console.warn("No bookings found.");
            return res.json({ success: true, message: 'No bookings found', bookings: [] });
        }

        console.log("Retrieved All Bookings:", results);
        res.json({ success: true, bookings: results });
    });
});


// Route: Retrieve All Orders
app.get('/get-all-orders', (req, res) =>  {
    const sql = 'SELECT id, room_number, item_name, price, order_time FROM food_orders ORDER BY order_time DESC';

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error retrieving orders:", err);
            return res.status(500).json({ success: false, message: 'Error retrieving orders' });
        }

        if (!results || results.length === 0) {
            console.warn("No orders found.");
            return res.json({ success: true, message: 'No orders found', orders: [] });
        }

        console.log("Retrieved All Orders:", results);
        res.json({ success: true, orders: results });
    });
});


// Route: Delete a Booking
app.delete('/delete-booking/:bookingId', (req, res) => {
    const { bookingId } = req.params;

    const deleteSQL = 'DELETE FROM bookings WHERE id = ?';
    db.query(deleteSQL, [bookingId], (err, result) => {
        if (err) {
            console.error("Database error during booking deletion:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ success: true, message: 'Booking deleted successfully' });
    });
});

// Route to delete a food order
app.delete('/delete-order/:userId/:itemName', (req, res) => {
    const { userId, itemName } = req.params;

    console.log(`Received request to delete order for user: ${userId}, item: ${itemName}`);

    const deleteOrderSQL = 'DELETE FROM food_orders WHERE user_id = ? AND item_name = ?';

    db.query(deleteOrderSQL, [userId, itemName], (err, result) => {
        if (err) {
            console.error("Database error while deleting order:", err.sqlMessage);
            return res.status(500).json({ success: false, message: `Database error: ${err.sqlMessage}` });
        }

        if (result.affectedRows === 0) {
            console.warn(`Order not found for user: ${userId}, item: ${itemName}`);
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        console.log(`Order deleted successfully for user: ${userId}, item: ${itemName}`);
        res.json({ success: true, message: 'Order removed successfully!' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
