import axios from 'axios';

const uploadImageToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file); // File to upload
    formData.append('upload_preset', 'unsigned_preset'); // Replace with your upload preset

    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/dnj7emmrm/image/upload',
      formData
    );
    return response.data.secure_url; // Return the URL of the uploaded image

    console.log('Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary.');
  }
};

export default uploadImageToCloudinary