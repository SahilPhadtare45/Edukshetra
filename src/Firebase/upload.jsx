import axios from 'axios';

const uploadFileToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file); // File to upload
    formData.append('upload_preset', 'unsigned_preset'); // Replace with your actual upload preset

    // Check file type to decide the correct Cloudinary endpoint
    const fileType = file.type.startsWith("image/") ? "image" : "raw"; 

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dnj7emmrm/${fileType}/upload`, 
      formData
    );

    console.log('Upload successful:', response.data);
    return response.data.secure_url; // Return the URL of the uploaded file
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary.');
  }
};

export default uploadFileToCloudinary;
