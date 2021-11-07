const express = require('express');
const {getAllBlogs, addBlog, updateBlog, getBlog, deleteBlog, updateLikeComment } = require('../controllers/blogController')
const Blog = require('../models/Blog')

const router = express.Router();

const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults')

router.get('/',advancedResults(Blog), getAllBlogs).post('/', protect, addBlog);
router.get('/:id', getBlog).put('/:id', protect, updateBlog).delete('/:id', protect, deleteBlog)
router.put('/updatelikecomment/:id', protect, updateLikeComment)


module.exports = router;