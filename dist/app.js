"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloudinary_cloud_name,
    api_key: config_1.default.cloudinary_api_key,
    api_secret: config_1.default.cloudinary_api_secret
});
// Set up Multer for images uploads
const imgStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
// Set up Multer for pdf uploads
const pdfStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
// const pdfFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//     if (file.mimetype === 'application/pdf') {
//         cb(null, true);
//     } else {
//         cb(new Error('Only PDFs are allowed!'), false);
//     }
// };
const imgUpload = (0, multer_1.default)({ storage: imgStorage });
const pdfUpload = (0, multer_1.default)({ storage: pdfStorage });
// test endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        systemHealth: 'Everything is alright',
        base: '/api/v1/upload/',
        images: '/image',
        pdf: '/pdf'
    });
});
// Route to upload single or multiple images
app.post('/api/v1/upload/image', imgUpload.array('images', 20), async (req, res) => {
    try {
        const files = req.files;
        const uploadPromises = files?.map(async (file) => {
            const filePath = file.path;
            const result = await cloudinary_1.v2.uploader.upload(filePath, { folder: 'avion' });
            // Delete the file from the server after uploading to Cloudinary
            fs_1.default.unlink(filePath, (err) => {
                if (err) {
                    console.error('Failed to delete local file:', err);
                }
            });
            return result.secure_url;
        });
        // Wait for all files to be uploaded
        const urls = await Promise.all(uploadPromises);
        // Send the URLs of the uploaded images back to the client
        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            urls: urls,
        });
    }
    catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).send('Server Error');
    }
});
// Route to upload single or multiple pdf
app.post('/api/v1/upload/pdf', pdfUpload.array('pdfs', 10), async (req, res) => {
    try {
        const files = req.files;
        const uploadPromises = files?.map(async (file) => {
            const filePath = file.path;
            const result = await cloudinary_1.v2.uploader.upload(filePath, {
                folder: 'avion/pdf',
                resource_type: 'raw'
            });
            fs_1.default.unlink(filePath, (err) => {
                if (err) {
                    console.error('Failed to delete local file:', err);
                }
            });
            return result.secure_url;
        });
        const urls = await Promise.all(uploadPromises);
        res.status(200).json({
            success: true,
            message: 'PDFs uploaded successfully',
            urls: urls,
        });
    }
    catch (error) {
        console.error('Error uploading PDFs:', error);
        res.status(500).send('Server Error');
    }
});
// not found endpoint
app.all('*', (req, res) => {
    res.status(404).send('not found');
});
// global error handler
app.use((err, req, res) => {
    const message = err.message || 'Something Wrong';
    return res.status(500).json({
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
