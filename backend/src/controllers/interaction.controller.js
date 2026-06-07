const Like = require('../models/like.model');
const Comment = require('../models/comment.model');
const Media = require('../models/media.model');

const toggleLike = async (req,res) => {
    try{
        const {mediaId} = req.params;
        const userId = req.user.id;// This was already written in verify jwt part

        const existingLike = await Like.findOne({media: mediaId,likedBy: userId});

        if(existingLike){
            // now we will toggle this like,make it unlike again
            await Like.findByIdAndDelete(existingLike._id);
            return res.status(200).json({ message: "Photo unliked successfully." });
        }

        else{
            await Like.create({media: mediaId,likedBy: userId});

            const photo = await Media.findById(mediaId);

            if(photo.uploadedBy.toString() !== userId){ // don't notify the user if they liked their own photo
                const io = req.app.get('socketio');

                io.to(photo.uploadedBy.toString()).emit("notification", {
                    type: "LIKE",
                    message: "Someone liked your photo",
                    mediaId: mediaId,
                    eventId: photo.event,
                    photoUrl: photo.url
                })
            } 

            return res.status(201).json({ message: "Photo liked successfully!" });
        }
    }
    catch(err) {
        console.error("Error in toggleLike: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const addComment = async(req,res) =>{
    try{
        const {mediaId} = req.params;
        const {content} = req.body;
        const userId = req.user.id;

        if(!content) {
            return res.status(400).json({message: "Comment content cannot be empty."});
        }

        const newComment = await Comment.create({
            media: mediaId,
            commentedBy: userId,
            content: content
        });

        const photo = await Media.findById(mediaId);

        if(photo && photo.uploadedBy.toString() !== userId){
            const io = req.app.get('socketio');
            
            io.to(photo.uploadedBy.toString()).emit("notification", {
                type: "COMMENT",
                message: "Someone just commented on your photo!",
                mediaId: mediaId,
                eventId: photo.event,
                photoUrl: photo.url
            });
        }

        res.status(201).json({
            message: "Comment posted successfully!",
            comment: newComment
        });
    }
    catch(err) {
        console.error("Error in addComment: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const getMediaDetails = async(req, res) => {
    try{
        const {mediaId} = req.params;
        const userId = req.user.id;

        const comments = await Comment.find({media: mediaId}).populate('commentedBy','username').sort({createdAt: -1}); // for newest comments at first

        const totalLikes = await Like.countDocuments({media: mediaId});

        const userLike = await Like.findOne({media: mediaId, likedBy: userId});
        const hasLiked = userLike ? true : false;

        res.status(200).json({
            message: "Media details fetched successfully",
            totalLikes: totalLikes,
            hasLiked: hasLiked,
            commentsCount: comments.length,
            comments: comments
        });
    }
    catch(err) {
        console.error("Error in getMediaDetails: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {toggleLike,addComment,getMediaDetails};