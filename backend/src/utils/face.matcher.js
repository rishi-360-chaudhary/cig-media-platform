const {RekognitionClient, CreateCollectionCommand, IndexFacesCommand, SearchFacesByImageCommand, ListFacesCommand, DeleteFacesCommand} = require('@aws-sdk/client-rekognition');
const fs = require('fs');

const rekognitionClient = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const COLLECTION_ID = "EventMediaPlatformFaces";

const initializeFaceCollection = async () => {
    try{
        const command = new CreateCollectionCommand({CollectionId: COLLECTION_ID});
        await rekognitionClient.send(command);
        console.log("Collection created successfully")
    }
    catch(err) {    
        if(err.name === "ResourceAlreadyExistsException")console.log("Collection is ready");
        else console.log("Error creating Face Collection:", error)
    }
}

const indexFacesInPhoto = async (localFilePath, mediaId) => {
    try{
        const imageBytes = fs.readFileSync(localFilePath);
        
        const command = new IndexFacesCommand({
            CollectionId: COLLECTION_ID,
            Image: {Bytes: imageBytes},
            ExternalImageId: mediaId.toString(),
            MaxFaces: 10,
            QualityFilter: "AUTO"
        });

        await rekognitionClient.send(command);
    }
    catch(err) {
        console.error("Error indexing faces:", error);
    }
};

const findMatchingPhotos = async (selfieFilePath) => {
    try{
        const imageBytes = fs.readFileSync(selfieFilePath);

        const command = new SearchFacesByImageCommand({
            CollectionId: COLLECTION_ID,
            Image: {Bytes: imageBytes},
            FaceMatchThreshold: 90,
            MaxFaces: 50
        })

        const response = await rekognitionClient.send(command);
        const matchedMediaIds = response.FaceMatches.map(match => match.Face.ExternalImageId);

        return [...new Set(matchedMediaIds)];
    }
    catch(err) {
        console.error("Error searching for faces:", error);
        return [];
    }
}

const deleteFacesFromPhoto = async(mediaId) => {
    try{
        const listCommand = new ListFacesCommand({CollectionId: COLLECTION_ID});
        const listResponse = await rekognitionClient.send(listCommand);

        const faceIdsToDelete = listResponse.Faces
            .filter(face => face.ExternalImageId === mediaId.toString())
            .map(face => face.FaceId);

        if (faceIdsToDelete.length > 0) {
            const deleteCommand = new DeleteFacesCommand({
                CollectionId: COLLECTION_ID,
                FaceIds: faceIdsToDelete
            });
            await rekognitionClient.send(deleteCommand);
            console.log(`Deleted ${faceIdsToDelete.length} face vectors from Rekognition.`);
        }
    }
    catch(err) {
        console.error("Error deleting faces from Rekognition:", err);
    }
}

module.exports = { 
    initializeFaceCollection, 
    indexFacesInPhoto, 
    findMatchingPhotos,
    deleteFacesFromPhoto
};