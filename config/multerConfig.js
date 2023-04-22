const dotenv = require('dotenv').config()
const multer = require("multer");

const upload = multer({ dest: process.env.MULTER_DESTINATION_URL });

module.exports = upload;
