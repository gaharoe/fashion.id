const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const firebase = require("../database/firebase");
const userCollection = firebase.collection('users');

const getUserByUsername = async (username) => {
    try {
        const doc = await userCollection.doc(username).get();
        if (!doc.exists) {return null;}
        return { id: doc.id, ...doc.data() };
    } catch (err) {
        console.error('Error ambil data:', err);
        return null;
    }
};

const login = async (req, res, next) => {
    const data = await getUserByUsername(req.body.username);
    if(!data){
        res.status(401).json({message: "username tidak ditemukan", err: 1});
    } else {
        bcrypt.compare(req.body.password, data.password, (err, result) => {
            if(result){
                req.user = data;
                next();
            } else {
                res.status(401).json({message: "password salah", err: 1});
            }
        });
    }
}


const auth = async (req, res) => {
    const token = req.cookies.login;
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {res.json({message: "login kembali", err: 1})}
        else {res.json(decoded);}
    });
}
module.exports = {login, auth};