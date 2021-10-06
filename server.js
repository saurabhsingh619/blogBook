const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors')


//load env vars
dotenv.config({path : './config/config.env'})

const app = express();

//Route files
const auth = require('./routes/authRoutes')

//Mount routers
app.use('/blogbook/v1/auth',auth);


const PORT = process.env.PORT || 8000;

const server = app.listen(
    PORT,
    console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

//Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise) => {
    console.log(`Error: ${err.message}`.red)
    //close server and exit process
    server.close(() => process.exit(1))
})