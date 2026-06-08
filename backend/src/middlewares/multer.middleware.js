const multer = require('multer');
const os = require('os');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, os.tmpdir()); // uses /tmp on Render — always exists
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.originalname + '-' + uniqueSuffix);
    }
});

const upload = multer({storage: storage});

module.exports = {upload};