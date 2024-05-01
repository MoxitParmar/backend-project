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

export { uploadOnCloudinary };
