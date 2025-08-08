require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const db = require('./database/firebaseQuery.js');
const multer = require("multer");
const {login, auth, authDev} = require('./utils/auth.js');
const cookieParser = require("cookie-parser");
const cloudinary = require("./database/cloudinary");
const fs = require('fs');

const date = new Date();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "temp/product");
    },
    filename: (req, file, cb) => {
        cb(null, `${date.getFullYear()}${date.getMonth().toString().padStart(2, '0')}${date.getDay().toString().padStart(2, '0')}-${file.originalname}`);
    }
});

const uploadProd = multer({storage: storage, limits: { fileSize: 100 * 1024 * 1024 } });
app.use(cors());
app.use(cookieParser());
app.use(express.json());
// ----- DEVELOPER SPACE -----------------------------------------
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post('/dev', (req, res) =>{
    if(req.body.password == "fashion-id-2-days") {
        res.sendFile(__dirname + "/doc.html");
    } else {
        res.json({err: 1});
    }
});

app.post("/clearCollection", async(req, res) => {
    await db.clearCollection(req.body.collection).catch(console.error);
    res.send("done");
});
// -------------------------------------------------------

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

app.post("/user/logout", (req, res) => {
    res.clearCookie('login', {
        httpOnly: true,
        secure: true
    });
    res.json({message: "logged out"});
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
    res.status(200).json({message: "update berhasil", err: 0});
});

// app.post("/user/picture", uploadPic.single('profile'), async(req, res, next) => {
//     try {
//         const result = await cloudinary.uploader.upload(req.file.path, {folder: 'profile'});
//         fs.unlinkSync(req.file.path);
//         req.body = {
//             username: result.secure_url};
//         next();
//     } catch (err) {
//         console.log(err.message);
//         res.status(401).json({message: "error upload file", err: 0});
//     }
// }, db.updateUser, (req, res) => {res.json({message: ""})});

app.post("/rating/create", db.createRating ,(req, res) => {
    res.status(200).json({message: "upload berhasil", err: 0});
});

app.post("/rating/latest", db.getRating.latest, (req, res) => {
    res.status(200).json(req.user);
});

app.post("/rating/dump", db.getRating.all, (req, res) => {
    res.status(200).json(req.user);
});

app.post("/product/create", uploadProd.single('product-pic'), async(req, res) => {
    const path = req.file.path;
    const result = await cloudinary.uploader.upload(path, {folder: 'product'});
    if(!!result){
        fs.unlinkSync(req.file.path);
        req.body.picture = result.secure_url;
        db.createProduct(req, res);
    } else {
        res.status(401).json({message: "gagal upload foto ke database", err:1});
    }
});

app.post("/product/getall", db.getProduct.all, (req, res) => {
    res.json(req.products);
});

app.post("/product/latest", db.getProduct.latest, (req, res) =>{
    res.json(req.products);
});

app.post("/product/update", (req, res) => {});
app.listen(3000, () => console.log("started"));