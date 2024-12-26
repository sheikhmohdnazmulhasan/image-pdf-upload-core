# Image and PDF Upload Core

This service provides a robust API for uploading images and PDF files to Cloudinary. It's built with Express.js and TypeScript, offering secure and efficient file handling.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm or yarn
- A Cloudinary account

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sheikhmohdnazmulhasan/image-pdf-upload-core.git
   cd image-pdf-upload-service
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory with the following content:

   ```bash
    CLOUD_NAME=your_cloud_name,
    API_KEY=your_api_key,
    API_SECRET=your_api_secret,
   ```

2. Replace the placeholder values with your actual Cloudinary credentials.

## API Endpoints

The service exposes the following endpoints:

1. **GET /** - Test endpoint

   - Returns: JSON object with system health and available endpoints

2. **POST /api/v1/upload/image** - Upload single or multiple images

   - Accept: multipart/form-data
   - Field name: `images`
   - Max files: 20
   - Returns: JSON object with upload status and image URLs

3. **POST /api/v1/upload/pdf** - Upload single or multiple PDFs
   - Accept: multipart/form-data
   - Field name: `pdfs`
   - Max files: 10
   - Returns: JSON object with upload status and PDF URLs

## Usage Examples

### Uploading Images

Using cURL:

```bash
curl -X POST -H "Content-Type: multipart/form-data" -F "images=@/path/to/image1.jpg" -F "images=@/path/to/image2.png" http://localhost:5000/api/v1/upload/image
```

Using JavaScript (with Fetch API):

```javascript
const formData = new FormData();
formData.append("images", imageFile1);
formData.append("images", imageFile2);

fetch("http://localhost:5000/api/v1/upload/image", {
  method: "POST",
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

### Uploading PDFs

Using cURL:

```bash
curl -X POST -H "Content-Type: multipart/form-data" -F "pdfs=@/path/to/document1.pdf" -F "pdfs=@/path/to/document2.pdf" http://localhost:5000/api/v1/upload/pdf
```

Using JavaScript (with Fetch API):

```javascript
const formData = new FormData();
formData.append("pdfs", pdfFile1);
formData.append("pdfs", pdfFile2);

fetch("http://localhost:5000/api/v1/upload/pdf", {
  method: "POST",
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

## Error Handling

The service includes error handling for common scenarios:

- If no files are uploaded, a 400 Bad Request response is returned.
- For server errors, a 500 Internal Server Error response is returned.
- All other undefined routes return a 404 Not Found response.

## Deployment

To deploy this service:

1. Ensure all environment variables are properly set.
2. Build the TypeScript files:
   ```bash
   npm run build
   ```
3. Start the server:
   ```bash
   npm start
   ```

For production deployment, consider using process managers like PM2 or deploying to cloud platforms like Heroku or AWS.

## Contributing

Contributions to this project are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
