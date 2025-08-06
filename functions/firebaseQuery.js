const firebase = require("./firebase");
const bcrypt = require("bcrypt");
const userCollection = firebase.collection('users');
const db = {
    createUser: async (req, res, next) => {
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
    },

    getUser: async (username) => {
        const collection = await userCollection.doc(username).get();
        return collection.exists ? {...collection.data()} : 0;
    }
}

module.exports = db;