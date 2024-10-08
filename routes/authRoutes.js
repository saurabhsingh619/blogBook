const express = require('express');
const { register, login, logout, getMe, updateDetails, updateFollow, forgotPassword, resetPassword, updatePassword} = require('../controllers/authController')

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails',protect, updateDetails)
router.put('/updatefollow',protect, updateFollow)
router.post('/forgotpassword', forgotPassword);
router.put('/resetPassword/:resettoken', resetPassword);
router.put('/updatepassword', protect, updatePassword);


module.exports = router;