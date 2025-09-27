# Medical Bill Frontend

React-based frontend for Medical Bill OCR and Text Processing.

## Features

- 🖼️ Image upload and preview
- 📝 Text input for direct processing
- 🎨 Beautiful, responsive UI
- 📊 Structured data display
- 🔄 Real-time processing status
- 📱 Mobile-friendly design

## Installation

```bash
cd frontend
# No npm install needed - uses CDN React
```

## Running

```bash
# Using Python HTTP server
npm start
# or
python -m http.server 3000

# Using Node.js (if you have it)
npx serve public -p 3000
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Image Processing**: Upload a medical bill image and click "Process Image"
2. **Text Processing**: Enter medical bill text in the textarea and click "Process Text"

## API Integration

The frontend communicates with the backend API running on `http://localhost:3002`:

- Image processing: `POST /api/extract-medical-bill`
- Text processing: `POST /api/extract-medical-bill-text`

## Technologies

- React 18 (via CDN)
- Babel for JSX transformation
- Modern CSS with gradients and animations
- Fetch API for HTTP requests

## Browser Support

- Modern browsers with ES6+ support
- React 18 compatibility
- Fetch API support
