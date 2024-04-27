// Import necessary modules
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');

// Create an instance of express
const app = express();

// Import routes
const mainRouter = require('./routes/user');

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/v1", mainRouter);

// Environment variables
const port = process.env.PORT || 3001;

// Function to start the server and connect to the database
const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        console.log("Connected successfully to MongoDB");
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
        console.log('Failed to connect to MongoDB:', error);
    }
};

// Start the server
start();
