const multer = require("multer");
const date = new Date();
const storageProfile = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "../temp/profile");
    },
    filename: (req, file, cb) => {
        cb(null, `${date.getFullYear()}${date.getMonth().toString().padStart(2, '0')}${date.getDay().toString().padStart(2, '0')}-${req.username}`);
    }
});
const storageProduct = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "../temp/product");
    },
    filename: (req, file, cb) => {
        cb(null, `${date.getFullYear()}${date.getMonth().toString().padStart(2, '0')}${date.getDay().toString().padStart(2, '0')}-${file.originalname}`);
    }
});
const upload = {
    profile: multer({storageProfile}),
    product: multer({storageProduct})
}
module.exports = upload;