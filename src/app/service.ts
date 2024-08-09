import { NextFunction } from "express";
import { v2 as cloudinary } from 'cloudinary';
import config from "./config";

export async function single(next: NextFunction) {

    try {
        // Configuration
        cloudinary.config({
            cloud_name: config.cloudinary_cloud_name,
            api_key: config.cloudinary_api_key,
            api_secret: config.cloudinary_api_secret
        });

        // Upload an image
        const uploadResult = await cloudinary.uploader
            .upload(
                'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
                public_id: 'shoes',
            }
            )
            .catch((error) => {
                console.log(error);
            });

        console.log(uploadResult);

        // Optimize delivery by resizing and applying auto-format and auto-quality
        const optimizeUrl = cloudinary.url('shoes', {
            fetch_format: 'auto',
            quality: 'auto'
        });

        console.log(optimizeUrl);

        // Transform the image: auto-crop to square aspect_ratio
        const autoCropUrl = cloudinary.url('shoes', {
            crop: 'auto',
            gravity: 'auto',
            width: 500,
            height: 500,
        });

        console.log(autoCropUrl);

    } catch (error) {
        next(error)
    }
}

export const Services = { single }