require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const { jsPDF } = require('jspdf');


const { MongoClient, ObjectId } = require('mongodb');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mongoose Connection for Transcripts
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongoose connection error:'));
db.once('open', function() {
    console.log("Connected successfully to MongoDB via Mongoose");
});

// Define Mongoose schema and model for transcripts
const TranscriptSchema = new mongoose.Schema({
    transcript: String,
    timestamp: { type: Date, default: Date.now }
});
const Transcript = mongoose.model('Transcript', TranscriptSchema);

// MongoDB client for fetching data
const client = new MongoClient(process.env.MONGODB_URI);

// Global variable to hold the latest processed data
let latestProcessedData = null;

// Route for posting transcripts
app.post('/transcripts', (req, res) => {
    if (!req.body.transcript) {
        return res.status(400).send('Transcript is required');
    }

    const newTranscript = new Transcript({ transcript: req.body.transcript });
    console.log("Attempting to save:", newTranscript);
    
    newTranscript.save()
        .then(() => {
            console.log("Saved successfully:", newTranscript);
            res.status(201).send('Transcript saved');

            // After saving, fetch data and call Python script
            fetchDataAndCallPython();
        })
        .catch(err => {
            console.error("Save failed:", err);
            res.status(400).json('Error: ' + err);
        });
});

// Function to fetch data and call a Python script
async function fetchDataAndCallPython() {
    const uri = process.env.MONGODB_URI; // MongoDB Atlas connection string loaded from .env file
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        const database = client.db('test'); // Replace with your database name
        const collection = database.collection('transcripts'); // Replace with your collection name

        const query = {}; // Your query to fetch data
        const projection = { transcript: 1 }; // Projection to fetch only the transcript field
        const sort = { timestamp: -1 }; // Sort by timestamp in descending order
        const result = await collection.find(query, projection).sort(sort).limit(1).toArray();
        
        if (result.length > 0) {
            console.log("Latest Transcript:", result[0].transcript);

            // Spawn a child Python process
            const childPython = spawn('python', ['flyway.py', result[0].transcript]); // Pass the latest transcription as a command-line argument
            console.log("Python script has started running");

            // Collect data from Python script
            childPython.stdout.on('data', (data) => {
                const jsonData = JSON.parse(data.toString()); // Parse the received data as JSON
                console.log("Python script has sent JSON data:", jsonData);
                updateLatestProcessedData(jsonData); // Update the latest processed data
            });

            childPython.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            childPython.on('close', (code) => {
                console.log(`Python script has finished running with code ${code}`);
            });

        } else {
            console.log("No transcripts found");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        await client.close();
        console.log("Disconnected from MongoDB Atlas");
    }
}

// Function to update the latest processed data
function updateLatestProcessedData(data) {
    latestProcessedData = data;
}

// Route to serve the latest processed data
app.get('/extracted-data', (req, res) => {
    if (latestProcessedData) {
        res.json(latestProcessedData);
    } else {
        res.status(404).send('No data available');
    }
});



async function fetchData(from, to) {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        const database = client.db('manish');
        const collection = database.collection('flight');

        const query = { from, to};
        const projection = { from: 1, to: 1, airline: 1, flightNumber: 1 };
        const result = await collection.find(query, { projection }).toArray();
        console.log(result);
        return result;
}
        catch (error) {
        console.error("Error connecting to the database:", error);
        throw new Error("Unable to connect to the database");
    } finally {
        await client.close();
    }
}

async function fetchLatestUserData() {
    const uri = process.env.MONGODB_URI; // MongoDB Atlas connection string loaded from .env file
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        const database = client.db('test'); // Replace 'test' with your actual database name
        const collection = database.collection('users'); // Replace 'users' with your actual collection name

        // Define the projection to fetch only the name and email fields
        const projection = { projection: { name: 1, email: 1, _id: 0 } };
        const options = {
            sort: { _id: -1 }, // Sort by _id in descending order
            limit: 1 // Limit to only the latest entry
        };

        // Perform the query to fetch the latest user
        const result = await collection.find({}, projection).sort({ _id: -1 }).limit(1).toArray();
        if (result.length > 0) {
            console.log("Latest user data:", result[0]);
        } else {
            console.log("No users found.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        await client.close();
        console.log("Disconnected from MongoDB Atlas");
    }
}

app.post('/search-flights', async (req, res) => {
    const { from, to } = req.body;
    try {
        const results = await fetchData(from, to);
        res.json(results);
    } catch (error) {
        console.error("Error searching flights:", error);
        res.status(500).json({ error: "An error occurred while searching flights" });
    }
});

app.post('/selectedflight', (req, res) => {
    const flightDetails = req.body; // Access the flight details sent from the frontend
    console.log('Received flight details:', flightDetails);
    fetchLatestUserData();
    // Process the booking here, then respond
    
    res.json({ message: 'Booking processed successfully', flightDetails });
  });



  app.post('/getdetails', async (req, res) => {
    try {
        // Assuming you have some way to get these flight details; here it's expected in the request body
        const flightDetails = req.body; 
        const userData = await fetchLatestUserData(); // Fetch the latest user data

        // Format the response with user and flight details
        if (userData) {
            const response = {
                userData: {
                    name: userData.name,
                    email: userData.email
                },
                flightDetails: {
                    flightNumber: flightDetails.flightNumber,
                    airline: flightDetails.airline,
                    from: flightDetails.from,
                    to: flightDetails.to,
                    _id: flightDetails._id  // Optionally include if it's necessary for the frontend
                }
            };

            res.json(response);
        } else {
            res.status(404).send("User data not found");
        }
    } catch (error) {
        console.error("Error fetching details:", error);
        res.status(500).send("Failed to fetch details");
    }
});





const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

fetchData()
