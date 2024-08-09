import express, { Request, Response } from 'express';
import multer, { Multer } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import config from './config';
const app = express();

// Configure Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_api_secret
});

// Set up Multer for file uploads
const storage: multer.StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload: Multer = multer({ storage });

// test endpoint
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        systemHealth: 'Everything is alright',
        message: 'Server is ready for hosting images',
        instruction: 'Send a POST request with a multipart/form-data body. Use the field name images for the file upload. upload single or multiple images. The API will return a JSON response containing a message and an array of urls',
        base: '/api/v1/'
    });
});

// Route to upload single or multiple images
app.post('/api/v1/upload', upload.array('images', 20), async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        const uploadPromises: Promise<string>[] = files.map(async file => {
            const filePath = file.path;
            const result = await cloudinary.uploader.upload(filePath, { folder: 'avion' });
            // Delete the file from the server after uploading to Cloudinary
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Failed to delete local file:', err);
                }
            });
            return result.secure_url;
        });

        // Wait for all files to be uploaded
        const urls: string[] = await Promise.all(uploadPromises);

        // Send the URLs of the uploaded images back to the client
        res.status(200).json({
            message: 'Images uploaded successfully',
            urls: urls,
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).send('Server Error');
    }
});

// not found endpoint
app.all('*', (req: Request, res: Response) => {
    res.status(404).send('not found');
});

// global error handler
app.use((err: any, req: Request, res: Response) => {
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
