"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const config_1 = __importDefault(require("./config"));
const streamifier_1 = __importDefault(require("streamifier"));
const app = (0, express_1.default)();
// CORS Configuration
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'https://avionrealty.ae',
        'https://www.avionrealty.ae'
    ]
}));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloudinary_cloud_name,
    api_key: config_1.default.cloudinary_api_key,
    api_secret: config_1.default.cloudinary_api_secret
});
// Set up Multer for handling in-memory file uploads
const imgUpload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const pdfUpload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Test endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        systemHealth: 'Everything is alright',
        base: '/api/v1/upload/',
        images: '/image',
        pdf: '/pdf'
    });
});
const uploadToCloudinary = (buffer, folder, resourceType) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder, resource_type: resourceType }, // Ensure resourceType is one of the allowed values
        (error, result) => {
            if (error)
                return reject(error);
            resolve(result?.secure_url || '');
        });
        streamifier_1.default.createReadStream(buffer).pipe(uploadStream); // Use buffer to create a readable stream
    });
};
// Route to upload single or multiple images
app.post('/api/v1/upload/image', imgUpload.array('images', 20), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded',
            });
        }
        const uploadPromises = files.map(file => {
            return uploadToCloudinary(file.buffer, 'avion', 'image'); // Pass 'image' as resourceType
        });
        const urls = await Promise.all(uploadPromises);
        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            urls,
        });
    }
    catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).send('Server Error');
    }
});
// Route to upload single or multiple PDFs
app.post('/api/v1/upload/pdf', pdfUpload.array('pdfs', 10), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files received',
            });
        }
        const uploadPromises = files.map(async (file) => {
            return await uploadToCloudinary(file.buffer, 'avion/pdf', 'raw');
        });
        const urls = await Promise.all(uploadPromises);
        res.status(200).json({
            success: true,
            message: 'PDFs uploaded successfully',
            urls,
        });
    }
    catch (error) {
        console.error('Error uploading PDFs:', error);
        res.status(500).send('Server Error');
    }
});
// Not found endpoint
app.all('*', (req, res) => {
    res.status(404).send('Not found');
});
// Global error handler
app.use((err, req, res, next) => {
    const message = err.message || 'Something went wrong';
    res.status(500).json({
        success: false,
        message,
        err
    });
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
