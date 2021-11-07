const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

//@desc Register user
//@route POST /blogbook/v1/auth/register
//@access public
exports.register = asyncHandler( async (req, res, next) => {
    const { name, username, email, password, bio } = req.body;
    //Create User
    const user = await User.create({
        name,
        username,
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
    if(req.user && req.user.id){
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        })
    }
    else{
        res.status(400).json({
            success: false
        })
    }
})


//@desc Update user details
//@route PUT /blogbook/v1/auth/updatedetails
//@access private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {}
    for(key in req.body){
        fieldsToUpdate[key] = req.body[key]
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    })
})

//@desc Update user password 
//@route PUT /blogbook/v1/auth/updatepassword
//@access private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //check current password
    if(!(user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
})

//@desc Update follow/unfollow details
//@route PUT /blogbook/v1/auth/updatefollow
//@access private
exports.updateFollow = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.user.id);
    let followingUser = await User.find({username: req.body.username});
    if(user.username != req.body.username){
        if(user.following.includes(req.body.username)){
            user.following.pop(req.body.username);
            followingUser[0].followers.pop(user.username);
        }
        else{
            user.following.push(req.body.username);
            followingUser[0].followers.push(user.username);
        }
        await followingUser[0].save();
        await user.save();
    }

    res.status(200).json({
        success: true,
        data: user
    })
})



//@desc Forgot password
//@route GET /blogbook/v1/auth/forgotpassword
//@access public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorResponse('There is no user with that email', 404))
    }

    //Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    //Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/blogbook/v1/auth/resetpassword/${resetToken}`

    const message = `You are receiving this email because you has requested the reset of password. Please make a put request to: \n\n ${resetUrl}`;

    try{
        await sendEmail({
            email : user.email,
            subject : 'BlogBook - Password Reset Token',
            message
        });

        res.status(200).json({
            success: true,
            data: 'Email sent'
        })
    }
    catch(err){
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave: false});

        return next(new ErrorResponse('Email could not be sent', 500))
    }
});


//@desc Reset password
//@route PUT /blogbook/v1/auth/resetpassword/:resettoken
//@access public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');
  
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  
    if (!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }
  
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
  
    sendTokenResponse(user, 200, res);
  });


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