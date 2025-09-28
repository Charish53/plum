# AI-Powered Amount Detection in Medical Documents

**Demo Video Link:** https://drive.google.com/file/d/1p54qc8BZRJKKfnxrTssmX1CkQ9vY5nTw/view?usp=sharing

## Overview

This project provides an AI-powered solution for extracting and analyzing amounts from medical documents using OCR and advanced text processing techniques.

## Features

- 🏥 Medical bill OCR processing with bounding boxes
- 📝 Direct text input processing  
- 🤖 AI-powered amount extraction and classification
- 🎨 Beautiful, responsive frontend interface
- 📊 Structured data display with confidence scores
- 🔄 Real-time processing status updates

## Project Structure

- `frontend/` - React-based web interface
- `backend/` - Node.js API server with OCR and AI integration
- `models/` - AI model configurations and data
- `postman-collection.json` - API testing collection

## Quick Start

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3002

## Documentation

- **[4-Stage Pipeline Documentation](AI-Powered%20Amount%20Detection%20in%20Medical%20Documents.md)** - Detailed explanation of the AI-powered amount extraction pipeline
- **[Architecture Diagram](architecture-diagram.md)** - Comprehensive system architecture and component diagrams
- **[API Documentation](postman-collection.json)** - Complete API testing collection with sample requests and responses

## Technologies

- **Frontend:** React 18, Modern CSS, Fetch API
- **Backend:** Node.js, Express.js, TypeScript
- **OCR:** PaddleOCR
- **AI:** Google Gemini AI
- **Testing:** Postman Collection

## License

This project is part of the AI-Powered Amount Detection system for medical document processing.
