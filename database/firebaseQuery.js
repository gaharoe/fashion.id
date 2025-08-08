const firebase = require("./firebase");
const bcrypt = require("bcrypt");
const userCollection = firebase.collection('users');
const ratingCollection = firebase.collection('rating');
const productCollection = firebase.collection('product');

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

// developer only
async function clearCollection(collectionName) {
  console.log(`Mulai hapus semua dokumen di collection "${collectionName}"...`);

  const snapshot = await firebase.collection(collectionName).get();
  if (snapshot.empty) {
    console.log(`Collection "${collectionName}" kosong, gak ada yang dihapus.`);
    return;
  }

  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    console.log(`Hapus: ${doc.id}`);
  }

  console.log(`Selesai hapus semua dokumen dari collection "${collectionName}".`);
}



const getUser = async (req, res, next) => {
    try {
        const collection = await userCollection.doc(req.body.username).get();
        req.user = {...collection.data()};
        next();
    } catch (err) {
        console.log(err.message);
        res.status(401).json({message: "data tidak ditemukan", err: 1});
    }
}

const updateUser = async(req, res, next) => {
    try {
        const collection = await userCollection.doc(req.body.username).update(req.body);
        next();
    } catch (err) {
        console.log(err.message);
        res.status(401).json({message: "update gagal!", err: 1});
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const collection = await userCollection.doc(req.body.username).delete();
        next();
    } catch(err){
        console.log(err.message);
        res.status(401).json({message: "delete gagal!", err: 1});
    }
}

const createRating = async (req, res, next) => {
    const userExist = await userCollection.where("username", "==", req.body.username).get();
    if(!userExist) {
        res.status(401).json({message: "user tidak ditemukan!", err: 1})
        return;
    };
    const userAlready = await ratingCollection.where("username", "==", req.body.username).get();
    if(userAlready) {
        res.status(401).json({message: "anda sudah mengirim ulasan", err: 1})
        return;
    };
    try {
        req.body.date = Date.now();
        const collection = await firebase.collection('rating').add(req.body);
        next();
    } catch (err) {
        console.log(err.message);
        res.status(401).json({message: "upload rating gagal!", err: 1});
    }
}

const getRating = {
    all: async(req, res, next) => {
        try {
            const collection = await ratingCollection.get();
            const ratings = [];
            collection.forEach(element => {
                ratings.push({ratingID: element.id, ...element.data()});
            });
            req.user = ratings;
            next();
        } catch(err){
            console.log(err.message);
            res.status(401).json({message: "gagal memuat rating", err: 1});
        }
    },
    latest: async(req, res, next) => {
        try {
            const collection = await ratingCollection.orderBy("date", "desc").limit(7).get();
            const ratings = [];
            collection.forEach(element => {
                ratings.push({...element.data()});
            });
            req.user = ratings;
            next();
        } catch(err){
            console.log(err.message);
            res.status(401).json({message: "gagal memuat rating", err: 1});
        }
    }
}

const createProduct = async(req, res) => {
    req.body.createdAt = Date.now();
    req.body.rating = 0;
    try {
        const doc = await productCollection.add(req.body);
        res.status(200).json({message: "product berhasil ditambahkan", err: 0});
    } catch(err){
        console.log(err.message);
        res.status(401).json({message: "gagal upload foto", err:1});            
    }
}

const getProduct = {
    all: async(req, res, next) => {
        try {
            const doc = await productCollection.get();
            const products = [];
            doc.forEach(element => {
                products.push({id: element.id, ...element.data()});
            });
            req.products = products;
            next();
        } catch(err){
            console.log(err.message);
            res.status(401).json({message: "gagal memuat semua product", err: 1});
        }
    },
    latest: async(req, res, next) => {
        try {
            const collection = await productCollection.orderBy("createdAt", "desc").limit(10).get();
            const products = [];
            collection.forEach(element => {
                products.push({id: element.id,...element.data()});
            });
            req.products = products;
            next();
        } catch(err){
            console.log(err.message);
            res.status(401).json({message: "gagal memuat product terbaru", err: 1});
        }
    }
}

const db = {
    clearCollection,
    createUser, 
    getUser, 
    deleteUser, 
    createRating, 
    updateUser, 
    getRating,
    createProduct,
    getProduct
}
module.exports = db;