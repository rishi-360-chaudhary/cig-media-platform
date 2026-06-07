const {RekognitionClient, DetectLabelsCommand, RecognizeCelebritiesCommand} = require('@aws-sdk/client-rekognition');
const fs = require('fs');

const rekognitionClient = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const generateSmartTags = async (localFilePath) => {
    try{
        const imageBytes = fs.readFileSync(localFilePath);

        const labelParams = {
            Image: {Bytes: imageBytes},
            MaxLabels: 5,
            MinConfidence: 75 
        };

        const labelCommand = new DetectLabelsCommand(labelParams);
        const labelResponse = await rekognitionClient.send(labelCommand);
        const objectTags = labelResponse.Labels.map(label => label.Name);

        const celebCommand = new RecognizeCelebritiesCommand({ 
            Image: {Bytes: imageBytes} 
        });

        const celebResponse = await rekognitionClient.send(celebCommand);
        const celebTags = celebResponse.CelebrityFaces.map(face => face.Name);

        const tags = [...celebTags, ...objectTags];

        console.log("AI Detected Tags: ", tags)

        return tags;
    }
    catch(err) {
        console.error("Error in AI Tagging: ", err);
        return [];
    }
}

module.exports = {generateSmartTags};