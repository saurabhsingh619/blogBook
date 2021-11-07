const Blog = require('../models/Blog')
const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

//@desc get all blog
//@route GET /blogbook/v1/blog
//@access public
exports.getAllBlogs = asyncHandler( async (req,res, next) => {

        res.status(200).json(res.advancedResults)

});

//@desc get single blog
//@route GET /blogbook/v1/blog/:id
//@access public
exports.getBlog = asyncHandler(async (req,res, next) => {
    const blog = await Blog.findById(req.params.id)
    if(!blog){
        return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
        success:true,
        data: blog
    })
});


//@desc add new blog
//@route POST /blogbook/v1/blog
//@access private
exports.addBlog = asyncHandler(async (req,res, next) => {

    //Add user to req.body
    req.body.blogger_id = req.user.id;
    const blog = await Blog.create(req.body)

    res.status(201).json({
        success:true,
        data: blog
    });

})

//@desc update blog
//@route PUT /blogbook/v1/blog/:id
//@access private
exports.updateBlog = asyncHandler(async (req,res, next) => {
    let blog = await Blog.findById(req.params.id)
    if(!blog){
        return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
    }

    //make sure user is owner of blog
    if(blog.blogger_id.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this blog`, 401));
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success:true,
        data: blog
    })
});

//@desc update blog
//@route PUT /blogbook/v1/blog/updatelikecomment/:id
//@access private
exports.updateLikeComment = asyncHandler(async (req, res, next) => {

    let blog = await Blog.findById(req.params.id)
    console.log(req)
    let user = await User.findById(req.user.id);
    if(!blog){
        return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404));
    }
    
    if(req.body.likeFlag){
        if(blog.likes.includes(user.username)){
            const index = blog.likes.indexOf(user.username)
            blog.likes.splice(index, 1);
        }
        else{
            blog.likes.push(user.username)
        }
    }
    if(req.body.comment){
        commentObject = {
            commenterUsername : user.username, 
            commentText: req.body.comment
        }
        blog.comments.push(commentObject)
    }

    await blog.save();

    res.status(200).json({
        success:true,
        data: blog
    })
});



//@desc delete blog
//@route DELETE /blogbook/v1/blog/:id
//@access private
exports.deleteBlog = asyncHandler(async (req,res, next) => {
    const blog = await Blog.findById(req.params.id)
    if(!blog){
        return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`, 404)); 
    }

    //make sure user is owner of bootcamp
    if(blog.blogger_id.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this blog`, 401));
    }

    blog.remove()
    res.status(200).json({
        success:true,
        data: {}
    })
});