const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const dotenv = require("dotenv");
const cors = require('cors');
const cookieParser = require('cookie-parser');


// Use built-in middleware for parsing
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

dotenv.config({path:'.env'});
const corsOptions = {
    origin: 'http://localhost:3000', // React app's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
    credentials: true
};
app.use(cors(corsOptions));
require('./DB/connect');
// const User=require('./models/userScema');
app.use(require('./router/auth'));

// Middleware function
// const middleware = (req, res, next) => {
//     console.log('hi anime');
//     next();
// }

// Connect to MongoDB Atlas

const port = process.env.PORT;

// Define routes
// app.get('/', (req, res) => {
//     res.send('hi');
// });

// app.get('/table', middleware, (req, res) => {
//     res.send('hi');
// });

// app.get('/score', (req, res) => {
//     res.send('hi');
// });

// app.get('/pointtable', (req, res) => {
//     res.send('History endpoint');
// });

app.get('/search', (req, res) => {
    res.send('Search endpoint');
});

app.get('/fixture', (req, res) => {
    res.send('Fixture endpoint');
});



// Basic error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
