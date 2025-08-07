require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const db = require('./database/firebaseQuery.js');
const upload = require("./utils/fileUpload.js");
const {login, auth} = require('./utils/auth.js');
const cookieParser = require("cookie-parser");

app.use(cors());
app.use(cookieParser());
app.use(express.json());


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/auth", auth);

app.post("/user/register", db.createUser, async (req, res) => {
    res.status(200).json({message: "registrasi berhasil", err: 0});
});

app.post("/user/login", login, (req, res) =>{
    const payload = {
        username: req.user.username,
        nama: req.user.nama
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});
    res.cookie('login', token, {
        httpOnly: true,
        secure:true
    });
    res.status(200).json({message: "login berhasil", err: 0});
});

app.post("/user/profile", db.getUser,(req, res) => {
    res.status(200).json({
        username: req.user.username,
        telepon: req.user.telepon,
        email: req.user.email,
        picture: req.user.picture
    });
});

app.post("/user/delete", db.deleteUser,(req, res) => {
    res.status(200).json({message:"data berhasil dihapus", err: 0});
});

app.post("/user/update", db.updateUser, (req, res) => {
    res.status(200).json({message: "upload berhasil", err: 0});
});

app.post("/rating/create", db.createRating ,(req, res) => {
    res.status(200).json({message: "upload berhasil", err: 0});
});

app.post("/rating/latest", db.getRating.latest, (req, res) => {
    res.status(200).json(req.user);
});

app.post("/rating/dump", db.getRating.all, (req, res) => {
    res.status(200).json(req.user);
});

app.listen(3000, () => console.log("started"));