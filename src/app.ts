import express, { Request, Response } from "express";
import cors from "cors";
import multer, { Multer } from "multer";
import { v2 as cloudinary } from "cloudinary";
import config from "./config";
import streamifier from "streamifier";
import { Server } from "http";
let server: Server;
const PORT = process.env.PORT || 5000;

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: "*", // Allow any origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

// Set up Multer for handling in-memory file uploads
const imgUpload: Multer = multer({ storage: multer.memoryStorage() });
const pdfUpload: Multer = multer({ storage: multer.memoryStorage() });

// Test endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    name: "image-pdf-upload-core",
    version: "1.0.0",
    description:
      "A robust API for securely uploading images and PDFs to Cloudinary",
    system_health: "Operational",
    base_url: "/api/v1/upload",
    endpoints: [
      {
        path: "/image",
        method: "POST",
        description: "Upload single or multiple images (max 20)",
        contentType: "multipart/form-data",
        formField: "images",
        maxFileSize: "10MB per file",
        allowedFormats: ["jpg", "jpeg", "png", "gif"],
      },
      {
        path: "/pdf",
        method: "POST",
        description: "Upload single or multiple PDFs (max 10)",
        contentType: "multipart/form-data",
        formField: "pdfs",
        maxFileSize: "20MB per file",
        allowedFormats: ["pdf"],
      },
    ],
    rateLimits: {
      requests: 100,
      per: "15 minutes",
    },
    documentation:
      "https://github.com/sheikhmohdnazmulhasan/image-pdf-upload-core#readme",
    maintainer: "nazmulofficial@outlook.com",
    exampleUsage: {
      curl: `curl -X POST -H "Content-Type: multipart/form-data" -F "images=@/path/to/image.jpg" ${
        req.protocol
      }://${req.get("host")}/api/v1/upload/image`,
      javascript: `
const formData = new FormData();
formData.append('images', imageFile);

fetch('${req.protocol}://${req.get("host")}/api/v1/upload/image', {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
      `,
    },
  });
});

const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "raw" | "auto"
) => {
  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType }, // Ensure resourceType is one of the allowed values
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream); // Use buffer to create a readable stream
  });
};

// Route to upload single or multiple images
app.post(
  "/api/v1/upload/image",
  imgUpload.array("images", 20),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const uploadPromises = files.map((file) => {
        return uploadToCloudinary(file.buffer, "avion", "image"); // Pass 'image' as resourceType
      });

      const urls: string[] = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        urls,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).send("Server Error");
    }
  }
);

// Route to upload single or multiple PDFs
app.post(
  "/api/v1/upload/pdf",
  pdfUpload.array("pdfs", 10),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files received",
        });
      }

      const uploadPromises: Promise<string>[] = files.map(async (file) => {
        return await uploadToCloudinary(file.buffer, "avion/pdf", "raw");
      });

      const urls: string[] = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        message: "PDFs uploaded successfully",
        urls,
      });
    } catch (error) {
      console.error("Error uploading PDFs:", error);
      res.status(500).send("Server Error");
    }
  }
);

// Not found endpoint
app.all("*", (req: Request, res: Response) => {
  res.status(404).send("Not found");
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: Function) => {
  const message = err.message || "Something went wrong";
  res.status(500).json({
    success: false,
    message,
    err,
  });
});

server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// async error handle
process.on("unhandledRejection", () => {
  console.log("UnhandledRejection is detected! shutting down the server...");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// synchronies error handle
process.on("uncaughtException", () => {
  console.log("UncaughtException is detected! shutting down the server...");
  process.exit();
});
