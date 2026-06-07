const {S3Client,PutObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3');
const fs = require('fs');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const uploadOnS3 = async (localFilePath, originalFileName, mimeType) =>{
    try{
        if(!localFilePath)return null;

        const fileStream = fs.createReadStream(localFilePath);

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${Date.now()}-${originalFileName}`,
            Body: fileStream,
            ContentType: mimeType
        }

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;


        return fileUrl;
    }
    catch(err) {
        console.error("Error uploading to S3: ", err);
        // we will still clear our laptop memory
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}

const deleteFromS3 = async (fileUrl) => {
    try{
        if (!fileUrl) return;

        const key = fileUrl.split('.com/')[1]; 
        if (!key) return;

        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        });

        await s3Client.send(command);
        console.log("Successfully deleted file from S3 bucket.");
    }
    catch(err) {
        console.error("Error deleting from S3:", err);
    }
}

module.exports = {uploadOnS3, deleteFromS3};