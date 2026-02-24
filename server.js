const express = require('express');
const app = express();
const path = require('path');

let users = []; 
let links = []; 

app.use(express.json());
app.use(express.static('.')); 

app.post('/api/register', (req, res) => {
    users.push(req.body);
    res.json({ success: true });
});

app.post('/api/add-link', (req, res) => {
    links.push({ ...req.body, date: new Date().toLocaleString() });
    res.json({ success: true });
});

app.get('/api/search', (req, res) => {
    const k = req.query.k ? req.query.k.toLowerCase() : "";
    res.json(links.filter(l => l.title.toLowerCase().includes(k)));
});

app.listen(process.env.PORT || 3000, () => console.log('Server is live!'));
