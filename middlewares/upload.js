const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { coverImageBasePath } = require('../models/contact');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const uploadPath = path.join('public', coverImageBasePath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, imageMimeTypes.includes(file.mimetype));
  }
});

module.exports = upload;