const Media = require('../models/media.model');
const Like = require('../models/like.model');
const Comment = require('../models/comment.model');
const {uploadOnS3} = require('../utils/s3.upload');
const {generateSmartTags} = require('../utils/ml.tagger');
const {indexFacesInPhoto, findMatchingPhotos} = require('../utils/face.matcher');
const sharp = require('sharp');
const fs = require('fs');
const {deleteFromS3} = require('../utils/s3.upload');
const {deleteFacesFromPhoto } = require('../utils/face.matcher');

const uploadMediaToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files were uploaded." });
        }

        console.log(`Processing batch upload of ${req.files.length} files...`);

        const uploadPromises = req.files.map(async (file) => {
            try{
                // generate AI Tags
                const generatedTags = await generateSmartTags(file.path);

                // upload to S3
                const cloudUrl = await uploadOnS3(file.path, file.originalname, file.mimetype);

                if (!cloudUrl) throw new Error(`Cloud upload failed for ${file.originalname}`);

                const newMedia = await Media.create({
                    event: eventId,
                    url: cloudUrl,
                    tags: generatedTags,
                    uploadedBy: req.user.id
                });

                await indexFacesInPhoto(file.path, newMedia._id);

                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

                return newMedia;

            } 
            catch(fileErr){
                console.error(`Failed to process ${file.originalname}:`, fileErr);
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                return null; 
            }
        });

        const results = await Promise.all(uploadPromises);
        
        const successfulUploads = results.filter(media => media !== null);

        res.status(201).json({
            message: `Successfully uploaded and processed ${successfulUploads.length} files!`,
            media: successfulUploads
        });

    } 
    catch(err){
        console.error("Error in uploadMediaToEvent: ", err);
        if (req.files) {
            req.files.forEach(file => {
                if(fs.existsSync(file.path))fs.unlinkSync(file.path);
            });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const getEventMedia = async (req,res)=>{
    try{
        const {eventId} = req.params;

        const media = await Media.find({event: eventId}).populate('uploadedBy','username role').sort({createdAt: -1});

        if(!media || media.length === 0){
            return res.status(404).json({ message: "No media found for this event." });
        }

        res.status(200).json({
            message: "Event album fetched successfully",
            count: media.length,
            media: media
        });
    }
    catch(err) {
        console.error("Error fetching event media: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const findMyPhotos = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).json({message: "Please upload a selfie to search."});
        }

        const matchedMediaIds = await findMatchingPhotos(req.file.path);

        if(fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }

        if(matchedMediaIds.length === 0){
            return res.status(200).json({
                message: "No matching photos found.",
                count: 0,
                photos: []
            });
        }

        const myGallery = await Media.find({_id: {$in: matchedMediaIds}})

        res.status(200).json({
            message: "Personalized gallery generated successfully!",
            count: myGallery.length,
            photos: myGallery
        });
    }
    catch(err) {
        console.error("Error in findMyPhotos: ", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const downloadWatermarkedMedia = async(req,res) => {
    try{
        const {mediaId} = req.params;
        const userRole = req.user.role || "Viewer";

        const media = await Media.findById(mediaId).populate('event');
        if(!media){
            return res.status(404).json({ message: "Media not found." });
        }

        const eventName = media.event.name || "One Piece";
        const clubName = "CIG IITR";
        const watermarkText = `${clubName} | ${eventName} | Downloaded by: ${userRole}`;

        const response = await fetch(media.url);
        if (!response.ok) throw new Error("Failed to fetch image from AWS");

        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        const metadata = await sharp(imageBuffer).metadata();
        const width = metadata.width;
        const height = metadata.height;
        const fontSize = Math.floor(width * 0.025);
        const boxHeight = fontSize * 2.5;

        const svgOverlay = `
        <svg width="${width}" height="${height}">
            <style>
                .watermark-text { 
                    fill: rgba(255, 255, 255, 0.95); /* Crisp white text */
                    font-size: ${fontSize}px; 
                    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; 
                    font-weight: 500;
                    letter-spacing: 2px; /* Adds that cinematic, premium feel */
                }
            </style>
            
            <defs>
                <linearGradient id="fade" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.0" />
                </linearGradient>
            </defs>
            <rect 
                x="0" 
                y="${height - (boxHeight * 2)}" 
                width="${width}" 
                height="${boxHeight * 2}" 
                fill="url(#fade)" 
            />
            
            <text 
                x="50%" 
                y="${height - (fontSize * 1.2)}" 
                text-anchor="middle" 
                class="watermark-text"
            >
                ${watermarkText}
            </text>
        </svg>`;

        const watermarkedBuffer = 
        await sharp(imageBuffer)
        .composite([
            {
                input: Buffer.from(svgOverlay),
                top: 0,
                left: 0
            }
        ])
        .toFormat('jpeg')
        .toBuffer();

        res.set({
            'Content-Type': 'image/jpeg',
            'Content-Disposition': `attachment; filename="watermarked_${mediaId}.jpg"` // for downloading
        });

        res.send(watermarkedBuffer);
    }
    catch(err) {
        console.error("Error in downloadWatermarkedMedia: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const deleteMedia = async (req, res) => {
    try{
        const {mediaId} = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const media = await Media.findById(mediaId);
        if (!media) {
            return res.status(404).json({ message: "Media not found." });
        }

        if (userRole !== 'admin' && media.uploadedBy.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to delete this media." });
        }

        await deleteFromS3(media.url);
        await deleteFacesFromPhoto(media._id);
        await Like.deleteMany({media: mediaId});
        await Comment.deleteMany({media: mediaId});
        await Media.findByIdAndDelete(mediaId);

        res.status(200).json({ message: "Media and all associated data deleted successfully." });
    }
    catch(err) {
        console.error("Error in deleteMedia: ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {uploadMediaToEvent,getEventMedia, findMyPhotos, downloadWatermarkedMedia, deleteMedia};