const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir, { recursive: true }); }

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadsDir), filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) });
const upload = multer({ storage: storage });

let users = {};
let children = [];
let growthData = {};
let medicalVisits = {};
let medicalDocuments = {};
let childIdCounter = 1;

function calculateAge(birthDate) { /* ... */ }

// --- API Routes ---
app.post('/api/upload', upload.single('avatar'), (req, res) => { if (!req.file) return res.status(400).json({ message: 'No file' }); res.json({ filePath: `/uploads/${req.file.filename}` }); });

app.post('/api/children', (req, res) => {
    const { firstName, lastName, gender, birthDate, avatar, ...otherData } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ message: 'Name required' });
    const newChild = { id: childIdCounter++, name: `${firstName} ${lastName}`, gender, birthDate, age: calculateAge(birthDate), avatar: avatar || 'https://i.pravatar.cc/100', ...otherData };
    children.push(newChild);
    if(otherData.height && otherData.weight) { growthData[newChild.id] = [{ date: birthDate, height: parseFloat(otherData.height), weight: parseFloat(otherData.weight) }]; }
    medicalVisits[newChild.id] = [];
    medicalDocuments[newChild.id] = [];
    res.status(201).json(newChild);
});

app.get('/api/children', (req, res) => res.json(children));
app.get('/api/children/:id', (req, res) => { const child = children.find(c => c.id === parseInt(req.params.id)); if (child) res.json(child); else res.status(404).json({ message: 'Not found' }); });

app.put('/api/children/:id', (req, res) => {
    const childIndex = children.findIndex(c => c.id === parseInt(req.params.id));
    if (childIndex > -1) {
        const { name, ...finalData } = req.body;
        children[childIndex] = { ...children[childIndex], ...finalData, name: name, age: calculateAge(finalData.birthDate) };
        res.status(200).json(children[childIndex]);
    } else { res.status(404).json({ message: 'Not found' }); }
});

app.delete('/api/children/:id', (req, res) => { const childId = parseInt(req.params.id); const initialLength = children.length; children = children.filter(c => c.id !== childId); if (growthData[childId]) delete growthData[childId]; if (medicalVisits[childId]) delete medicalVisits[childId]; if (children.length < initialLength) res.status(200).json({ message: 'Deleted' }); else res.status(404).json({ message: 'Not found' }); });

app.get('/api/growth/:childId', (req, res) => res.json(growthData[req.params.childId] || []));
app.post('/api/growth/:childId', (req, res) => { const { childId } = req.params; const { date, height, weight } = req.body; if (!date || !height || !weight) return res.status(400).json({ message: 'All fields required.' }); if (!growthData[childId]) growthData[childId] = []; const newRecord = { date, height: parseFloat(height), weight: parseFloat(weight) }; growthData[childId].push(newRecord); growthData[childId].sort((a, b) => new Date(a.date.replace(/\//g, '-')) - new Date(b.date.replace(/\//g, '-'))); res.status(201).json(newRecord); });
app.delete('/api/growth/:childId/:date', (req, res) => { const { childId, date } = req.params; if (growthData[childId]) { const initialLength = growthData[childId].length; growthData[childId] = growthData[childId].filter(record => record.date !== date); if (growthData[childId].length < initialLength) res.status(200).json({ message: 'Record deleted' }); else res.status(404).json({ message: 'Record not found' }); } else res.status(404).json({ message: 'Child not found' }); });

app.get('/api/visits/:childId', (req, res) => res.json(medicalVisits[req.params.childId] || []));
app.post('/api/visits/:childId', (req, res) => { const { childId } = req.params; const { date, doctorName, reason, summary } = req.body; if (!date || !doctorName || !reason) return res.status(400).json({ message: 'All fields required' }); if (!medicalVisits[childId]) medicalVisits[childId] = []; const newVisit = { date, doctorName, reason, summary }; medicalVisits[childId].push(newVisit); medicalVisits[childId].sort((a, b) => new Date(b.date.replace(/\//g, '-')) - new Date(a.date.replace(/\//g, '-'))); res.status(201).json(newVisit); });

app.post('/api/documents/:childId', upload.single('document'), (req, res) => {
    const { childId } = req.params;
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    if (!medicalDocuments[childId]) medicalDocuments[childId] = [];
    const newDocument = { title: title || req.file.originalname, filePath: `/uploads/${req.file.filename}`, uploadDate: new Date().toISOString().split('T')[0].replace(/-/g, '/') };
    medicalDocuments[childId].push(newDocument);
    res.status(201).json(newDocument);
});
app.get('/api/documents/:childId', (req, res) => res.json(medicalDocuments[req.params.childId] || []));

app.get('/api/backup', (req, res) => {
    const backupData = {
        users,
        children,
        growthData,
        medicalVisits,
        medicalDocuments,
        childIdCounter
    };
    res.json(backupData);
});

app.get('/api/stats', (req, res) => {
    const totalChildren = children.length;
    const averageAge = children.reduce((acc, child) => acc + child.age, 0) / (totalChildren || 1);
    res.json({ totalChildren, averageAge: averageAge.toFixed(1) });
});

app.post('/api/restore', (req, res) => {
    const {
        users: restoredUsers,
        children: restoredChildren,
        growthData: restoredGrowthData,
        medicalVisits: restoredMedicalVisits,
        medicalDocuments: restoredMedicalDocuments,
        childIdCounter: restoredChildIdCounter
    } = req.body;

    users = restoredUsers || {};
    children = restoredChildren || [];
    growthData = restoredGrowthData || {};
    medicalVisits = restoredMedicalVisits || {};
    medicalDocuments = restoredMedicalDocuments || {};
    childIdCounter = restoredChildIdCounter || 1;

    res.status(200).json({ message: 'Data restored successfully' });
});

app.listen(port, () => console.log(`Roshdyar server is listening on port ${port}`));