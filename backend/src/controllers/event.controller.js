const Event = require('../models/event.model');
const Media = require('../models/media.model');
const Like = require('../models/like.model');
const Comment = require('../models/comment.model');
const {deleteFromS3} = require('../utils/s3.upload');
const {deleteFacesFromPhoto} = require('../utils/face.matcher');

const createEvent = async (req,res) => {
    try{
        const {name,description,date,category} = req.body;

        const newEvent = await Event.create({
            name,
            description,
            date,
            category
        });

        res.status(201).json({
            message: "Event created successfully",
            event: newEvent
        });
        
    }
    catch(err){
        console.error("Error creating event: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const getAllEvents = async(req, res) => {
    try{
        const events = await Event.find().sort({ date: -1 });
        
        res.status(200).json({
            message: "Events fetched successfully",
            events: events
        });
    }
    catch(err) {
        console.error("Error fetching events: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userRole = req.user.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ message: "Only Admins can delete events." });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        const associatedMedia = await Media.find({ event: eventId });

        console.log(`Cascading delete started for event: ${event.name}. Cleaning up ${associatedMedia.length} photos...`);

        for (const mediaItem of associatedMedia) {
            
            await deleteFromS3(mediaItem.url);
            
            await deleteFacesFromPhoto(mediaItem._id);

            await Like.deleteMany({ media: mediaItem._id });
            await Comment.deleteMany({ media: mediaItem._id });
        }

        await Media.deleteMany({event: eventId});

        await Event.findByIdAndDelete(eventId);

        res.status(200).json({ 
            message: "Event and all associated cloud assets/interactions deleted cleanly!" 
        });

    } 
    catch (err) {
        console.error("Error in deleteEvent: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports = {createEvent, getAllEvents, deleteEvent};