require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const PDFDocument = require('pdfkit-table');
// const { jsPDF } = require('jspdf');

const { MongoClient} = require('mongodb');
const { spawn } = require('child_process');
const { stringify } = require('querystring');


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mongoose Connection for Transcripts
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Mongoose connection error:'));
db.once('open', function() {
    console.log("Connected successfully to MongoDB via Mongoose");
});




// Define Mongoose schema and model for transcripts



const PassengerSchema = new mongoose.Schema({
  sr_no: Number,
  name: String,
  age: Number,
  gender: String,
  email: String,
  phoneNumber: Number || +91,
  countryCode: Number || 222,
  state: String,
  timestamp: { type: Date, default: Date.now }
});
const passenger = mongoose.model('Passenger Details', PassengerSchema);


const TranscriptSchema = new mongoose.Schema({
    transcript: String,
    timestamp: { type: Date, default: Date.now }
});
const Transcript = mongoose.model('Transcript', TranscriptSchema);

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

        const database = client.db('flight');
        const collection = database.collection('leloo');

        const query = { from, to};
        const projection = { from: 1, to: 1, airline: 1, flightNumber: 1,  price: 1, scheduledDepartureTime: 1, scheduledArrivalTime: 1 };
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
    const uri = process.env.MONGODB_URI;
    // console.log("MongoDB URI:", uri); // Log MongoDB URI to verify if it's loaded correctly

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        const database = client.db('test');
        const collection = database.collection('users');

        const projection = { projection: { name: 1, email: 1, _id: 0 } };
        const options = {
            sort: { _id: -1 },
            limit: 1
        };

        const result = await collection.find({}, projection).sort({ _id: -1 }).limit(1).toArray();
        if (result.length > 0) {
            console.log("Latest user data:", JSON.stringify(result));
        } else {
            console.log("No users found.");
        }
        return result[0];

    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
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

// app.post('/selectedflight', (req, res) => {
//     const flightDetails = req.body; // Access the flight details sent from the frontend
//     console.log('Received flight details:', flightDetails);
//     fetchLatestUserData();
//     // Process the booking here, then respond
//     res.json({ message: 'Booking processed successfully', flightDetails });
//   });



//   app.post('/getdetails', async (req, res) => {
//     try {
//         // Assuming you have some way to get these flight details; here it's expected in the request body
//         const flightDetails = req.body; 
//         const userData = await fetchLatestUserData(); // Fetch the latest user data

//         // Format the response with user and flight details
//             const response = {
//                 userData: {
//                     name: userData.name,
//                     email: userData.email
//                 },
//                 flightDetails: {
//                     flightNumber: flightDetails.flightNumber,
//                     airline: flightDetails.airline,
//                     from: flightDetails.from,
//                     to: flightDetails.to,
//                     _id: flightDetails._id  // Optionally include if it's necessary for the frontend
//                 }
            
//             }
//             res.json(response);
//     } catch (error) {
//         console.error("Error fetching details:", error);
//         res.status(500).send("Failed to fetch details");
//     }
// });


let combined = [];
app.post('/selectedflight', async (req, res) => {
    const flightdetails = req.body; // Access the flight details sent from the frontend
    console.log('Received flight details:', flightdetails);
    try {
    const flightDetails= {
        flightNumber: flightdetails.flightNumber,
        airline: flightdetails.airline,
        from: flightdetails.from,
        to: flightdetails.to,
        _id: flightdetails._id,
        class: "Economy"
    };
    
        combined = flightDetails;

        res.json({ message: 'Booking processed successfully', combined });
    } catch (error) {
        console.error("Error processing booking:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/passengerdata', async (req, res) => {
 
    if (!req.body.passengerData) {
        return res.status(400).send('data required is required');
    }

  try{
    const passengerdetails = await passenger.insertMany(req.body.passengerData);
    // passengerdetails.save();

      const final = combinedData(combined,passengerdetails)
     if(passengerdetails)
            console.log("Saved successfully:", passengerdetails);
            res.status(201).send('Passenger data is saved in db');
     }
     catch(err) {
            console.error("Save failed:", err);
            res.status(400).json('Error: ' + err);
        };
});
    

// ... other setup ...

app.get('/getPdfGenerated', (req, res) => {
  const filePath = `./output5.pdf`;

  // Error handling: Make sure the file exists
  fs.access(filePath, (err) => {
    if (err) {
      console.error('PDF file not found:', err);
      res.status(404).send('PDF file not found');
      return;
    }

    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf'); 
    res.download(filePath)
  
  });
});


async function fetchPassengerData() {
  
  const uri = process.env.MONGODB_URI;
    // console.log("MongoDB URI:", uri); // Log MongoDB URI to verify if it's loaded correctly

    const client = new MongoClient(uri);
  try{

    const database = client.db('test');
    const collection = database.collection('Passenger Details');

    const contents = { contents: { 
      name: 1,
      age: 1,
      gender: 1,
      email: 1,
      phoneNumber: 1,
      countryCode: 1,
      state: 1 ,
      _id: 0 } };
      
    const options = {
        sort: { _id: -1 },
        limit: 1
    };

    const result = await collection.find({}, contents).sort({ _id: -1 }).limit(1).toArray();

    if (result.length > 0) {
        console.log("Latest user data got from the db as passenger data:", JSON.stringify(result));
    } else {
        console.log("No users found.");
    }
    return result[0];

} catch (error) {
    console.error("Error fetching data:", error);
    throw error;
} finally {
    await client.close();
    console.log("Disconnected from MongoDB Atlas");
}
}


async function combinedData(flightDetails,passangerresult) {
    
    try {
        console.log("Inside combinedData function");
        console.log("Flight details:", flightDetails);
        
        const userdata = await fetchLatestUserData();
        console.log("User data::", userdata);
        
        // const passengerData=await fetchPassengerData()
        // const passangerresult = await fetchPassengerData();
        console.log("Passenger Data::",passangerresult);

        const userData= {
            name: userdata.name,
            email: userdata.email,
            departureDate: "20 APR 24",
            returnDate: "21 APR 24",
        };
        // Generate PDF document
        await generatePDF(flightDetails, userData,passangerresult[0]);
  
        
    
    } catch (error) {
        console.error("Error fetching combined data:", error);
        throw error;
    }
}


function generatePDF(flightDetails, userData,passangerresult) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream('output5.pdf');
      doc.pipe(stream);

        doc.fontSize(8);
      
      
    const lorem = `
    • This is your E-Ticket Iternary. You must bring it to the airport for check-in, and it is recommended you to retain a copy for your records.
    • Each passenger travelling needs a printed copy of this document for immigrations, customs, airport security checks and duty free purchases.
    • Economy Class passengers should report to airline check-in desks 3 hours prior to departure of all flights. First and Business Class passengers should
    report to airline check-in desks not later than 1 hour prior to departure. Boarding for your flight begins at least 35 minutes before your scheduled
    departure time. Gates close 15 minutes prior to departure`
      
      // Styles for specific elements (adjust as needed)
    
    //   const Margin_layout = (doc) => {
        
    //   doc.rect(doc.x-10, -5, 480, doc.y+800).stroke();
        
    //   let box_factor = 1;
    //     for (let index = 0; index < 20; index++) {
    //       if((box_factor+index)%2==0){
    //         doc.rect(doc.x-50, index*42, 40, doc.y-30).fillOpacity(0.2)
    //         .fillAndStroke("red", "#900");
    //       }
    //     else {
    //         doc.fillOpacity(0.4).rect(doc.x-80, 10+index*42, 40, doc.y-30).fillAndStroke("#FFC000","#603c06");
    //         // doc.rect(doc.x-80, 10+index*42, 40, doc.y-30).stroke().fillOpacity(0.2)
    //       }
    //     }
      
    //     for (let index = 0; index < 20; index++) {
    //       if((box_factor+index)%2==0){
    //         doc.rect(doc.x+470, index*42, 40, doc.y-30).fillOpacity(0.2)
    //         .fillAndStroke("red", "#900");
    //       }
    //       else doc.fillOpacity(0.4).rect(doc.x+500, 10+index*42, 40, doc.y-30).fillAndStroke("#FFC000","#603c06");
    //     }
    // };
    
    // Margin_layout(doc);
    //Tittle Section
    
    doc.fillColor("black").fillOpacity(0.9).font('Times-Bold');
    doc.fontSize(25);
    
    doc.text('Boarding Ticket', { underline: false, align: 'center', fonts: 'Times-Roman'});
    doc.moveTo(60, 120) // Move the "pen" to coordinates (100, 150)
    .lineTo(540, 120) // Draw a line from (100, 150) to (200, 150)
    .fillAndStroke('black');
    
    doc.moveDown();
    
    //Important info
    doc.fontSize(10).text('Important information',{ lineGap:0.5}).font('Times-Roman');
    doc.fontSize(8);
      doc.text(`${lorem}`, {
      width: 480,
      lineGap:1,
      align:'left',
  
  }
  );

    // Header section (adjust spacing and alignment as needed)
    doc.moveDown(1.5)
    doc.fillColor("black").fillOpacity(1).font('Times-Bold');
    doc.fontSize(10);
    
      doc.text(`Booking Id: ${flightDetails._id}`,{bold: true})
      doc.moveDown(0.4)
     
  
      // Passenger information section
  
      const table = {
        title: "Booking Information",
        headers: ['S NO.', 'User','Email', 'Class'],
        rows: [
          ['1', userData.name,userData.email, flightDetails.class],
        ]
      };
      
      // Create a table with basic styling (adjust as needed)
      doc.fontSize(8);
      const tableWidth = doc.page.width -10 - 15;
      const columnWidths = [20, tableWidth / 2 - 20, 20, tableWidth / 2 - 20]; // Adjust column widths
  
      doc.table(table, {
        cellPadding: 5,
        columns: columnWidths,
        headRowBackgroundColor: '#f5f5f5',  // Light gray background for header row 
        prepareRow:()=> doc.font("Helvetica").fontSize(8),
      });
  
      // Flight details section
      doc.moveDown();
  
  
        const tableFlight = {
          title: "Flight Information",
          headers: [
            { label: "Flight", property: 'name', width: 150, renderer: null },
            { label: "Depart/Arrive", property: 'description', width: 170 },
            { label: "Departure/Arrival Date", property: 'date', width: 150}, 
  
          ],
          // complex data
          datas: [
            
            {
              name: {label: `Flight No.: ${flightDetails.flightNumber}`,options:{ fontSize: 6} }, 
              date: `${userData.departureDate}`, 
              description: `${flightDetails.from}` 
            },
            { 
              options: { separation: true},
              name: ' ', 
              date: `${userData.returnDate}`, 
              description: `${flightDetails.to}` 
            }, 
          ],
          // simeple data
          rows: [],
        };
  
        doc.table(tableFlight, {
          cellPadding: 6,
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: () => {
            doc.font("Helvetica").fontSize(8);
            
          },
        });
        
        doc.moveDown()

        // table passenger information.......

          let index = 1;
        const tablePassenger = {
            title: "Passenger Information",
            headers: [
            { label: "S NO.", property: 'number', width: 50, renderer: null },
            { label: "Passanger Name", property: 'name', width: 120 },
            { label: "Email", property: 'mail_description', width: 150},
            { label: "Age", property: 'num', width: 100},
            { label: "Gender", property: 'drop_name', width: 50},
        ],
            datas: [
                {   
                  options:{seperation:true},
                number: `${index}`, 
                name: {label: `${passangerresult.name}`,options:{ fontSize: 8} }, 
                mail_description: `${passangerresult.email}`, 
                num:  `${passangerresult.age}`,  
                drop_name: ` ${passangerresult.gender}`  
              },
                
              // {   
              //   number: `index`, 
              //   name: {label: `Gohan `,options:{ fontSize: 8} }, 
              //   mail_description: `Email`, 
              //   num:  `20`,  
              //   drop_name: ` Male` , 
              // },
            ]
          };
          
          doc.table(tablePassenger, {
            cellPadding: 6,
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
            prepareRow: () => {
              doc.font("Helvetica").fontSize(8);
            },
          });

        //   doc.table(tablePassenger, {
        //     cellPadding: 5,
        //     columns: columnWidths,
        //     headRowBackgroundColor: '#f5f5f5',  // Light gray background for header row 
        //     prepareRow:()=> doc.font("Helvetica").fontSize(9),
        //   });
      
  
  // Fare Table with input data...
  
  
  
  doc.fontSize(15).font('Times-Bold');
  doc.text('Fare');      
  
  const tableFare = {
    // title: "",
          headers: ["Fare Information"," Amount"],
          rows: [
            ['Fare', "3560 ruppes",],
            [ 'Charge',"200 ruppes"],
            [ 'balance',"INR(-)600"],
            [  'Total Amount',"3160 ruppes"],
          ]
        };
       
        doc.table(tableFare, {
          cellPadding: 5,
          columns: columnWidths,
          headRowBackgroundColor:'yellow',
          // headRowBackgroundColor: '#f5f5f5',  // Light gray background for header row 
          prepareRow:()=> {
                doc.font("Helvetica").fontSize(8).fillColor('black');
                
            }
        });
        
        
        // Additional sections or styling can be added here
      doc.moveDown(2.5)

        // doc.fillColor("brown").fillOpacity(0.8).font('Times-Bold');
        // doc.fontSize(40);
        doc.fillColor("#0b77ca").fillOpacity(0.8).font('Times-Bold').fontSize(30).text('FLYWAY',{align:"left"});
        doc.fillColor("green")
        doc.fontSize(12).text(`STATUS: CONFIRMED ✔✔`);
        // doc.text(`${flightDetails.airline}`,{bold: true, fonts: 'Times-Roman'});
      doc.end();
  
      stream.on('finish', () => {
        console.log('PDF generation completed');
        resolve();
      });
      
      stream.on('error', (error) => {
        console.error('Error generating PDF:', error);
        reject(error);
      });
    });
  }


fetchData();



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
