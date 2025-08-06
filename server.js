require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const db = require('./functions/firebaseQuery.js');

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/user/register", db.createUser, async (req, res) => {
    res.status(200).json({msg: "registrasi berhasil", err: 0});
    // res.redirect("/login");
});

app.post("/user/profile", async (req, res) => {
    const user =  await db.getUser(req.body.username);
    if(!user){
        res.json({msg: "user unknow", err: 1, data: user});
    } else {
        res.json({
            username: user.username,
            telepon: user.telepon,
            email: user.email,
            picture: user.picture
        });
    }
});

// app.post("/")

app.listen(3000, () => console.log("started"));