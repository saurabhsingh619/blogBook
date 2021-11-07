const mongoose = require('mongoose');


const BlogSchema = new mongoose.Schema({
    heading:{
        type: String,
        required: [true, 'Please add a heading']
    },
    content:{
        type: String,
        required: [true, 'Please add a blog content']
    },
    blogger_id:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    likes:{ 
        type : Array , 
        default : [] 
    },
    comments:{
        type : Array,
        default : []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Blog', BlogSchema)