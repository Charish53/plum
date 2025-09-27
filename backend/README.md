# Medical Bill Backend API

Backend API for Medical Bill OCR and Text Processing with Gemini AI integration.

## Features

- 🏥 Medical bill OCR processing with bounding boxes
- 📝 Direct text input processing
- 🤖 Gemini AI integration for structured data extraction
- 🔄 Fallback mechanisms for API failures
- 📊 Dynamic entity detection for amounts
- 🎯 Text format analysis

## API Endpoints

- `GET /health` - Health check
- `POST /api/extract-medical-bill` - Process medical bill images
- `POST /api/extract-medical-bill-text` - Process medical bill text directly
- `POST /api/ocr-with-boxes` - OCR with bounding boxes
- `POST /api/ocr` - Simple OCR text extraction

## Installation

```bash
cd backend
npm install
```

## Configuration

Set your Gemini API key in `ocr-server.ts`:
```typescript
const GEMINI_API_KEY = 'your-gemini-api-key-here';
```

## Running

```bash
# Development
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3002`

## Dependencies

- Express.js for API server
- PaddleOCR for text extraction
- Google Generative AI (Gemini) for structured data extraction
- Multer for file uploads
- CORS for cross-origin requests

## Environment

- Node.js 18+
- TypeScript
- tsx for development
