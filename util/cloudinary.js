const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("TYPE:", typeof process.env.CLOUDINARY_API_KEY);
console.log("LEN:", process.env.CLOUDINARY_API_KEY?.length);
console.log("KEY:", JSON.stringify(process.env.CLOUDINARY_API_KEY));
module.exports = cloudinary;