const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MySQL Database Connection Configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      // Replace with your MySQL username
  password: "Subham1001",  // Replace with your MySQL password
  database: "user"           // Use 'user' database
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// Serve the landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Landingpage.html"));
});

// Serve the appointment booking page
app.get("/book-appointment", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "BookAppointment.html"));
});

app.post("/api/appointments", (req, res) => {
    const { name, email, date, symptoms } = req.body;
    console.log("Received data from client:", { name, email, date, symptoms });

    const query = "INSERT INTO appointments (name, email, date, symptoms) VALUES (?, ?, ?, ?)";
    db.query(query, [name, email, date, symptoms], (err, result) => {
        if (err) {
            console.error("Database error:", err); // Log database error
            res.status(500).send("Error saving appointment.");
        } else {
            console.log("Appointment saved successfully:", result);
            res.send("Appointment booked successfully!");
        }
    });
});


// Start the server and open the landing page in the default browser
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Dynamically import 'open' for compatibility with ES Module format
  const open = (await import("open")).default;
  open(`http://localhost:${PORT}`);
});


// Fetch and serve all appointments
app.get("/appointments", (req, res) => {
    const query = "SELECT * FROM appointments";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error retrieving appointments:", err);
            res.status(500).send("Error retrieving appointments.");
        } else {
            // Send the data as JSON to render dynamically in Appointment.html
            res.json(results);
        }
    });
});

app.get("/Appointments", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "Appointment.html"));
});
