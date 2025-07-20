const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// In-memory data stores
const users = {};
const children = [];
let childIdCounter = 1;

console.log('Server memory is ready.');

app.get('/', (req, res) => res.send('Roshdyar Backend is running!'));

// Auth Routes
app.post('/api/login', (req, res) => { /* ... code unchanged ... */ });
app.post('/api/signup', (req, res) => { /* ... code unchanged ... */ });

// --- Children Routes ---
app.get('/api/children', (req, res) => {
    console.log("Sending children list:", children);
    res.json(children);
});

app.post('/api/children', (req, res) => {
    const { firstName, lastName, birthDate } = req.body;
    if (!firstName || !lastName || !birthDate) {
        return res.status(400).json({ message: 'Required fields are missing.' });
    }
    const newChild = { 
        id: childIdCounter++,
        name: `${firstName} ${lastName}`,
        birthDate,
        age: `${Math.floor(Math.random() * 10) + 1} ساله`,
        avatar: `https://i.pravatar.cc/100?u=${childIdCounter}`
    };
    children.push(newChild);
    console.log("Children list updated:", children);
    res.status(201).json(newChild);
});

app.listen(port, () => {
  console.log(`Roshdyar server is listening on port ${port}`);
});
