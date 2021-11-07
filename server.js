const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')


//load env vars
dotenv.config({path : './config/config.env'})

//Connect to database
connectDB();

const app = express();

//body parser
app.use(express.json());

//Route files
const auth = require('./routes/authRoutes')
const blog = require('./routes/blogRoutes')

//Mount routers
app.use('/blogbook/v1/auth',auth);
app.use('/blogbook/v1/blog',blog);


app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const server = app.listen(
    PORT,
    console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// //Handle unhandled promise rejections
// process.on('unhandledRejection',(err,promise) => {
//     console.log(`Error: ${err.message}`.red)
//     //close server and exit process
//     server.close(() => process.exit(1))
// })sendTokenResponse(user, 200, res);