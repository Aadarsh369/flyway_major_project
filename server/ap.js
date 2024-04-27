require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // to support JSON-encoded bodies

app.post('/selectedflight', async (req, res) => {
    const flightDetails = req.body; // Access the flight details sent from the frontend
    console.log('Received flight details:', flightDetails);
    fetchLatestUserData(); // Ensure the function completes before responding
    // Process the booking here, then respond
    res.json({ message: 'Booking processed successfully', flightDetails });
});

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

const database = () => {
    // Prevent the default form submit action
    fetch('http://localhost:3001/search-flights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: formData.from, to: formData.to })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Search results:', data);
      // you might want to redirect or do something with the data here
      history.push('/details', { flights: data });
    })
    .catch(error => console.error('Error:', error));
  };


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

fetchLatestUserData()
