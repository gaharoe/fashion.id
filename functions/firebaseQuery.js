const firebase = require("./firebase");
const bcrypt = require("bcrypt");

const userCollection = firebase.collection('users');
const ratingCollection = firebase.collection('rating');

const createUser = async (req, res, next) => {
    const collection = await userCollection.get();
    const collectionID = [];
    collection.forEach(data => collectionID.push(data.id));
    if(collectionID.includes(req.body.username)){
        res.status(401).json({message: "username already exist", err: 1});
    } else if(req.body.username == "" || req.body.nama == "" || req.body.password == "" || req.body.telepon == "" ){
        res.status(401).json({message: "data tidak boleh kosong", err: 1});

    } else {
        try {
            const userData = {
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, 10),
                telepon: req.body.telepon,
                email: req.body.email,
                // picture: req.body.picture,
                registerDate: Date.now()
            }
            const create = await userCollection.doc(req.body.username).set(userData);
            next();
        } catch (err) {
            console.log(err.message);
            res.status(401).json({message: "Internal server error!", err: 1});
        }
    }
}

const getUser = async (username) => {
    const collection = await userCollection.doc(username).get();
    return collection.exists ? {...collection.data()} : 0;
}

const deleteUser = async (username) => {
    if(!(await getUser(username))){
        return 0;
    } else {
        const collection = await userCollection.doc(username).delete();
        return 1;
    }
}

const createRating = async (data) => {
    try {
        const time = new Date();
        const date = time.getDate().toString().padStart(2, "0");
        const month = time.getMonth().toString().padStart(2, "0");
        const year = time.getFullYear();
        data.date = `${date}/${month}/${year}`;
        const collection = await ratingCollection.doc().set(date);
        return 1;
    } catch (err) {
        console.log(err.message);
        return 0;
    }
}

const db = {createUser, getUser, deleteUser, createRating}
module.exports = db;