const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

//@desc Register user
//@route POST /blogbook/v1/auth/register
//@access public
exports.register = asyncHandler( async (req, res, next) => {
    const { name, email, password, bio } = req.body;
    //Create User
    const user = await User.create({
        name,
        email,
        password,
        bio
    });
    
    sendTokenResponse(user, 200, res);
});

//@desc Login user
//@route POST /blogbook/v1/auth/login
//@access public
exports.login = asyncHandler( async (req, res, next) => {

    const { email, password } = req.body;

    //validate email and password
    if(!email || !password){
        return next(new ErrorResponse('Please add an email and password', 400));
    }

    //check for user
    const user = await User.findOne({email }).select('+password');
    if(!user){
        return next(new ErrorResponse('Invalid Credentials', 401));
    }

    //check if password matches
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return next(new ErrorResponse('Invalid Credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});


//@desc logout current user/ clear cookie
//@route GET /blogbook/v1/auth/logout
//@access private
exports.logout = asyncHandler(async (req, res, next) => {

    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        data: {}
    })
})


//@desc Get current logged in user
//@route GET /blogbook/v1/auth/me
//@access private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
})



const sendTokenResponse = (user, statusCode, res) => {
    //Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 ),
        httpOnly: true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res
     .status(statusCode)
     .cookie('token', token, options)
     .json({
        success: true,
        token
     })

};