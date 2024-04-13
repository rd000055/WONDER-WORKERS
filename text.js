const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/wonder', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define Schema
const contactSchema = new mongoose.Schema({
    name: String,
    companyName: String,
    email: String,
    phone: String,
    message: String
}, { collection: 'Contact1' });

// Define Model
const Contact = mongoose.model('Contact', contactSchema);

// Middleware to parse JSON bodies
app.use(express.json());

// Handle form submissions
app.post('/contact', async (req, res) => {
    try {
        const { name, companyName, email, phone, message } = req.body;
        const contact = new Contact({ name, companyName, email, phone, message });
        await contact.save();
        res.status(201).send('Contact form submitted successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error submitting contact form');
    }
});

// Read data from contact file and store into MongoDB
app.get('/read-and-store', (req, res) => {
    // Read data from contact file
    fs.readFile('contact.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading contact file');
        }
        
        // Split data by lines and process each line
        const lines = data.split('\n');
        lines.forEach(async line => {
            const [name, companyName, email, phone, message] = line.split(',');
            const contact = new Contact({ name, companyName, email, phone, message });
            try {
                await contact.save();
                console.log(`Contact saved: ${name}`);
            } catch (error) {
                console.error(`Error saving contact ${name}: ${error}`);
            }
        });

        res.status(200).send('Data read from contact file and stored into MongoDB');
    });
});

// Serve homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
