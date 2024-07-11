const express = require('express')
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const app = express()
const path = require('path')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage
})

dotenv.config();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));


// EJS setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('layout', 'layouts/layout');

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Import routes
const contactRouter = require('./routes/contacts');
app.use('/contacts', contactRouter);

const userRouter = require('./routes/users');
app.use('/users', userRouter);

app.get('/', async (req, res) => {
  res.render('index', { user: req.session.user, layout: false })
})



app.listen(process.env.PORT || 3000)