import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure cloudinary with the provided credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a file to cloudinary
const uploadOnCloudinary = async (localFilePath) => {
        try {
                if (!localFilePath) return null; // If no file path is provided, return null

                // Upload the file on cloudinary
                const response = await cloudinary.uploader.upload(localFilePath, {
                        resource_type: "auto"
                });

                // File has been uploaded successfully
                // Remove the locally saved temporary file
                fs.unlinkSync(localFilePath);

                return response; // Return the cloudinary response

        } catch (error) {
                // Remove the locally saved temporary file as the upload operation failed
                fs.unlinkSync(localFilePath);

                return null; // Return null in case of error
        }
}

// Function to extract the public ID from a cloudinary URL
const extractPublicId = (cloudinaryUrl) => {
        // Split the URL by / to get the public ID
        const splitUrl = cloudinaryUrl.split("/");

        // Get the last part of the URL which is the public ID
        const publicId = splitUrl[splitUrl.length - 1].split(".")[0];

        return publicId; // Return the extracted public ID
}

// function to delete an image from cloudinary
const deleteFromCloudinary = async (publicId) => {
        try {
                // Delete the file from cloudinary
                const response = await cloudinary.uploader.destroy(publicId);

                return response; // Return the cloudinary response

        } catch (error) {
                return null; // Return null in case of error
        }
}

// function to delete a video from cloudinary
const deletevideoFromCloudinary = async (publicId) => {
        try {
                // Delete the file from cloudinary
                const response = await cloudinary.uploader.destroy(publicId, { resource_type : 'video' });

                return response; // Return the cloudinary response

        } catch (error) {
                return null; // Return null in case of error
        }
}

// function to get the duration of a video from cloudinary
const getVideoLength = async (publicId) => {
        try {
                // Delete the file from cloudinary
                const response = await cloudinary.api.resource(publicId, { resource_type: 'video' , media_metadata: true});

                return response.duration; // Return the cloudinary response

        } catch (error) {
                return 10; // Return null in case of error
        }
}

// Export the functions to be used in other files
export { uploadOnCloudinary , deleteFromCloudinary , extractPublicId, deletevideoFromCloudinary, getVideoLength};
