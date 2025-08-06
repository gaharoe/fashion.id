require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const db = require('./firebase.js');

const dbCollection = db.collection('data'); 

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post('/users', async(req, res) => {
    const snapshot = await dbCollection.get();
    const users = [];
    snapshot.forEach(data => {
        users.push({...data.data()});
    });
    console.log(users);
    res.send(users[0]);
});


app.listen(3000, () => console.log("started"));