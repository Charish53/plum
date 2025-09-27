import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { OCRWithBoundingBoxes } from './ocr-with-boxes.ts';

const app = express();
const port = 3002;

// Gemini API Key
const GEMINI_API_KEY = 'AIzaSyDtA5VW6z3blPvTD4BVjLryuE9-iq1MvGk';

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Initialize OCR service
let ocrService: OCRWithBoundingBoxes;
let isInitialized = false;

async function initializeOCRService() {
  try {
    console.log('Initializing OCR Service with Gemini API...');
    ocrService = new OCRWithBoundingBoxes(GEMINI_API_KEY);
    await ocrService.initialize();
    isInitialized = true;
    console.log('OCR Service initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize OCR Service:', error);
    isInitialized = false;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'OCR with Bounding Boxes API',
    initialized: isInitialized,
    timestamp: new Date().toISOString()
  });
});

// Text input endpoint for direct text processing
app.post('/api/extract-medical-bill-text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No text provided for processing.' 
      });
    }

    console.log(`📝 Processing medical bill text: ${text.length} characters`);

    // Extract structured medical bill data using Gemini AI
    const result = await ocrService.extractMedicalBillDataFromText(text);

    console.log('✅ Medical bill text extraction completed');
    res.json({
      status: 'success',
      data: result.data,
      htmlTable: result.htmlTable
    });

  } catch (error) {
    console.error('❌ Error in medical bill text extraction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

// OCR with bounding boxes endpoint
app.post('/api/ocr-with-boxes', upload.single('image'), async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({
        status: 'error',
        message: 'OCR service not initialized'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    console.log(`🔍 Processing image: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // Extract text with bounding boxes
    const result = await ocrService.extractTextWithBoxes(req.file.buffer);

    console.log(`✅ OCR completed. Found ${result.totalBoxes} text elements`);
    res.json(result);

  } catch (error) {
    console.error('❌ Error in OCR processing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Simple OCR endpoint (text only)
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({
        status: 'error',
        message: 'OCR service not initialized'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    console.log(`🔍 Processing image: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // Extract text only
    const text = await ocrService.extractText(req.file.buffer);

    console.log(`✅ OCR completed. Extracted ${text.length} characters`);
    res.json({
      text: text,
      length: text.length,
      status: 'success'
    });

  } catch (error) {
    console.error('❌ Error in OCR processing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Medical bill extraction endpoint with Gemini AI
app.post('/api/extract-medical-bill', upload.single('image'), async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(503).json({
        status: 'error',
        message: 'OCR service not initialized'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    console.log(`🏥 Processing medical bill: ${req.file.originalname}, size: ${req.file.size} bytes`);

    // Extract structured medical bill data using Gemini AI
    const result = await ocrService.extractMedicalBillData(req.file.buffer);

    console.log('✅ Medical bill extraction completed');
    res.json({
      status: 'success',
      data: result.data,
      htmlTable: result.htmlTable
    });

  } catch (error) {
    console.error('❌ Error in medical bill extraction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Start server
app.listen(port, async () => {
  console.log(`🚀 OCR with Gemini AI API running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔍 OCR with boxes: POST http://localhost:${port}/api/ocr-with-boxes`);
  console.log(`📝 Simple OCR: POST http://localhost:${port}/api/ocr`);
  console.log(`🏥 Medical Bill Extraction: POST http://localhost:${port}/api/extract-medical-bill`);
  
  await initializeOCRService();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (ocrService) {
    await ocrService.destroy();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  if (ocrService) {
    await ocrService.destroy();
  }
  process.exit(0);
});
