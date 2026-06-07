const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    media: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: true
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{timestamps: true});

likeSchema.index({media: 1, likedBy: 1}, {unique: true});// we are doing this to ensure one user one media like policy

module.exports = mongoose.model('Like', likeSchema);