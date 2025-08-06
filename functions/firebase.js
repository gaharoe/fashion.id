require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firebase = admin.firestore();
module.exports = firebase;
