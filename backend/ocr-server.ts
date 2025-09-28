import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { OCRWithBoundingBoxes } from './ocr-with-boxes';
import { AmountExtractionService } from './src/services/amount-extraction';
import { AmountExtractionController } from './src/controllers/amount-extraction.controller';

const app = express();
const port = process.env.PORT || 3002;

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760');
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Validate required environment variables
if (!GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: CORS_ORIGIN
}));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE, // Configurable file size limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Initialize services
let ocrService: OCRWithBoundingBoxes;
let amountExtractionService: AmountExtractionService;
let amountExtractionController: AmountExtractionController | undefined;
let isInitialized = false;

async function initializeServices() {
  try {
    console.log('Initializing services...');
    
    // Initialize OCR service
    console.log('Initializing OCR Service with Gemini API...');
    ocrService = new OCRWithBoundingBoxes(GEMINI_API_KEY || '');
    await ocrService.initialize();
    
    // Initialize Amount Extraction service
    console.log('Initializing Amount Extraction Service...');
    amountExtractionService = new AmountExtractionService(GEMINI_API_KEY);
    amountExtractionController = new AmountExtractionController(amountExtractionService, () => isInitialized);
    
    isInitialized = true;
    console.log('All services initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    isInitialized = false;
  }
}

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({
    status: 'ok',
    service: 'OCR with Bounding Boxes API',
    initialized: isInitialized,
    timestamp: new Date().toISOString()
  });
});

// Text input endpoint for direct text processing
app.post('/api/extract-medical-bill-text', async (req: any, res: any) => {
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
      error: (error as Error).message
    });
  }
});

// OCR with bounding boxes endpoint
app.post('/api/ocr-with-boxes', upload.single('image'), async (req: any, res: any) => {
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
      error: (error as Error).message
    });
  }
});

// Simple OCR endpoint (text only)
app.post('/api/ocr', upload.single('image'), async (req: any, res: any) => {
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
    const ocrResult = await ocrService.extractTextWithBoxes(req.file.buffer);
    const text = ocrResult.fullText;

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
      error: (error as Error).message
    });
  }
});

// Medical bill extraction endpoint with Gemini AI
app.post('/api/extract-medical-bill', upload.single('image'), async (req: any, res: any) => {
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
    console.log('🚀 Starting medical bill extraction pipeline...');

    // Extract structured medical bill data using Gemini AI
    const result = await ocrService.extractMedicalBillData(req.file.buffer);

    console.log('✅ Medical bill extraction completed successfully!');
    console.log('📊 Final result summary:');
    console.log('  - Data keys:', Object.keys(result.data));
    console.log('  - HTML table length:', result.htmlTable.length);
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
      error: (error as Error).message
    });
  }
});

// ===== AMOUNT EXTRACTION APIs =====

// Step 1: Extract raw tokens from text
app.post('/api/amount-extraction/step1', (req, res) => amountExtractionController!.step1(req, res));

// Step 2: Normalize amounts (from text)
app.post('/api/amount-extraction/step2', (req, res) => amountExtractionController!.step2(req, res));

// Step 3: Classify amounts by context (from text)
app.post('/api/amount-extraction/step3', (req, res) => amountExtractionController!.step3(req, res));

// Step 4: Generate final output (from text)
app.post('/api/amount-extraction/step4', (req, res) => amountExtractionController!.step4(req, res));

// Complete pipeline execution
app.post('/api/amount-extraction/pipeline', (req, res) => amountExtractionController!.pipeline(req, res));

// Start server
app.listen(port, async () => {
  console.log(`🚀 OCR with Gemini AI API running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔍 OCR with boxes: POST http://localhost:${port}/api/ocr-with-boxes`);
  console.log(`📝 Simple OCR: POST http://localhost:${port}/api/ocr`);
  console.log(`🏥 Medical Bill Extraction: POST http://localhost:${port}/api/extract-medical-bill`);
  console.log(`💰 Amount Extraction APIs:`);
  console.log(`   Step 1 - Raw Tokens: POST http://localhost:${port}/api/amount-extraction/step1`);
  console.log(`   Step 2 - Normalization: POST http://localhost:${port}/api/amount-extraction/step2`);
  console.log(`   Step 3 - Classification: POST http://localhost:${port}/api/amount-extraction/step3`);
  console.log(`   Step 4 - Final Output: POST http://localhost:${port}/api/amount-extraction/step4`);
  console.log(`   Complete Pipeline: POST http://localhost:${port}/api/amount-extraction/pipeline`);
  
  await initializeServices();
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
