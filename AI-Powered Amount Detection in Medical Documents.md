# Problem Statement 8: AI-Powered Amount Detection in Medical Documents

## Demo Link

[Click here to view the demo video](https://drive.google.com/file/d/1p54qc8BZRJKKfnxrTssmX1CkQ9vY5nTw/view?usp=sharing)

A sophisticated 4-step pipeline for extracting, normalizing, and classifying monetary amounts from medical bills and financial documents using LLM (Large Language Model) integration with regex fallback mechanisms.

## 🚀 Overview

The AI-Powered Amount Detection system is a comprehensive solution that combines OCR (Optical Character Recognition) and AI processing to extract, normalize, and classify monetary amounts from medical bills and financial documents. The system uses Google's Gemini AI for intelligent processing with robust fallback mechanisms to ensure reliability.

### Key Features

- **OCR Text Extraction**: Extract text from medical bill images using PaddleOCR
- **AI-Powered Processing**: Use Google Gemini 2.0 Flash for intelligent text analysis
- **4-Step Amount Pipeline**: Systematic extraction, normalization, and classification of monetary amounts
- **Multiple Input Methods**: Support for image uploads and direct text input
- **Fallback Mechanisms**: Regex-based processing when AI services are unavailable
- **Comprehensive API**: RESTful endpoints for all processing stages

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AI-Powered Amount Detection System                    │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   OCR Service   │    │   AI Service    │
│   (React)       │    │   (Express.js)  │    │   (PaddleOCR)   │    │   (Gemini AI)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • Image Upload  │    │ • REST API      │    │ • Text          │    │ • LLM           │
│ • Text Input    │    │ • Controllers   │    │   Extraction    │    │   Processing    │
│ • Results       │    │ • Services      │    │ • Bounding      │    │ • Fallback      │
│   Display       │    │ • Middleware    │    │   Boxes         │    │   Mechanisms    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 4-Step Amount Extraction Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           4-Step Amount Extraction Pipeline                     │
└─────────────────────────────────────────────────────────────────────────────────┘

    Input Text
         │
         ▼
┌─────────────────┐
│   Step 1:       │
│   Raw Token     │
│   Extraction    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Step 2:       │
│   Amount        │
│   Normalization │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Step 3:       │
│   Context       │
│   Classification│
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Step 4:       │
│   Final Output  │
│   Generation    │
└─────────────────┘
         │
         ▼
    Structured
    Amount Data
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Data Flow Architecture                             │
└─────────────────────────────────────────────────────────────────────────────────┘

Medical Bill Image
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OCR Service   │───▶│   Text          │───▶│   AI Service    │
│   (PaddleOCR)   │    │   Extraction    │    │   (Gemini)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Bounding      │    │   Raw Text      │    │   Structured    │
│   Boxes         │    │   Content       │    │   Data          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Amount        │    │   Amount        │    │   Amount        │
│   Extraction    │    │   Extraction    │    │   Extraction    │
│   Pipeline      │    │   Pipeline      │    │   Pipeline      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Final         │    │   Final         │    │   Final         │
│   Results       │    │   Results       │    │   Results       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

- **OCR Services**: PaddleOCR integration for text extraction from images
- **MedicalBillProcessor**: Service for structured medical bill data extraction
- **AmountExtractionService**: Main service class implementing the 4-step pipeline
- **AmountExtractionController**: Express.js controller handling API endpoints
- **AI Integration**: Google Gemini 2.0 Flash model for intelligent processing
- **Fallback Mechanisms**: Regex-based processing when LLM is unavailable

### Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                Technology Stack                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Frontend:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React 18      │    │   HTML5/CSS3    │    │   JavaScript    │
│   (CDN)         │    │   (Modern)      │    │   (ES6+)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘

Backend:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Node.js       │    │   Express.js    │    │   TypeScript    │
│   (Runtime)     │    │   (Framework)   │    │   (Language)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

OCR & AI:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PaddleOCR     │    │   Google        │    │   ONNX Runtime  │
│   (Engine)      │    │   Gemini AI     │    │   (Inference)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 API Endpoints

### OCR Text Extraction

#### OCR with Bounding Boxes
```http
POST /api/ocr-with-boxes
Content-Type: multipart/form-data

FormData: image (file)
```

**Response:**
```json
{
  "fullText": "Complete extracted text...",
  "textBoxes": [
    {
      "text": "Sample text",
      "confidence": 0.95,
      "bbox": [x1, y1, x2, y2]
    }
  ],
  "totalBoxes": 25,
  "averageConfidence": 0.89,
  "status": "success"
}
```

### Amount Extraction Endpoints

### Individual Step Endpoints

#### Step 1: Raw Token Extraction
```http
POST /api/amount-extraction/step1
Content-Type: application/json

{
  "text": "Your medical bill text here..."
}
```

**Response:**
```json
{
  "status": "success",
  "step": 1,
  "result": {
    "raw_tokens": ["1200", "1000", "200"],
    "currency_hint": "INR",
    "confidence": 0.85
  }
}
```

#### Step 2: Amount Normalization
```http
POST /api/amount-extraction/step2
Content-Type: application/json

{
  "text": "Your medical bill text here..."
}
```

**Response:**
```json
{
  "status": "success",
  "step": 2,
  "result": {
    "normalized_amounts": [1200, 1000, 200],
    "normalization_confidence": 0.9
  },
  "raw_tokens": ["1200", "1000", "200"]
}
```

#### Step 3: Context Classification
```http
POST /api/amount-extraction/step3
Content-Type: application/json

{
  "text": "Your medical bill text here..."
}
```

**Response:**
```json
{
  "status": "success",
  "step": 3,
  "result": {
    "amounts": [
      {
        "type": "total_bill",
        "value": 1200,
        "entity": "Grand Total"
      },
      {
        "type": "paid",
        "value": 1000,
        "entity": "Amount Paid"
      },
      {
        "type": "due",
        "value": 200,
        "entity": "Outstanding Balance"
      }
    ],
    "confidence": 0.85
  },
  "raw_tokens": ["1200", "1000", "200"],
  "normalized_amounts": [1200, 1000, 200]
}
```

#### Step 4: Final Output Generation
```http
POST /api/amount-extraction/step4
Content-Type: application/json

{
  "text": "Your medical bill text here..."
}
```

**Response:**
```json
{
  "status": "success",
  "step": 4,
  "result": {
    "currency": "INR",
    "amounts": [
      {
        "type": "total_bill",
        "value": 1200,
        "source": "text: 'Grand Total: 1200.00'"
      },
      {
        "type": "paid",
        "value": 1000,
        "source": "text: 'Amount Paid: 1000.00'"
      },
      {
        "type": "due",
        "value": 200,
        "source": "text: 'Outstanding: 200.00'"
      }
    ],
    "status": "ok"
  },
  "raw_tokens": ["1200", "1000", "200"],
  "normalized_amounts": [1200, 1000, 200],
  "classified_amounts": [...]
}
```

### Complete Pipeline Endpoint

#### Full Pipeline Execution
```http
POST /api/amount-extraction/pipeline
Content-Type: application/json

{
  "text": "Your medical bill text here..."
}
```

**Response:**
```json
{
  "status": "success",
  "pipeline": "complete",
  "result": {
    "currency": "INR",
    "amounts": [
      {
        "type": "total_bill",
        "value": 1200,
        "source": "text: 'Grand Total: 1200.00'"
      },
      {
        "type": "paid",
        "value": 1000,
        "source": "text: 'Amount Paid: 1000.00'"
      },
      {
        "type": "due",
        "value": 200,
        "source": "text: 'Outstanding: 200.00'"
      }
    ],
    "status": "ok"
  }
}
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ or Bun
- Google Gemini API key (optional, for LLM features)
- Git (for cloning the repository)

### Quick Start

1. **Clone the Repository**
```bash
git clone <repository-url>
cd plum
```

2. **Backend Setup**
```bash
cd backend
npm install
# or
bun install
```

3. **Environment Configuration**
Create a `.env` file in the backend directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3002
```

4. **Start the Backend Server**
```bash
npm start
# or
bun start
```

The backend server will start on `http://localhost:3002`

5. **Frontend Setup (Optional)**
```bash
cd frontend
# No npm install needed - uses CDN React
python -m http.server 3000
# or
npx serve public -p 3000
```

The frontend will be available at `http://localhost:3000`

### Health Check

```bash
curl http://localhost:3002/health
```

### Development Setup

```bash
# Backend development
cd backend
npm run dev

# Frontend development
cd frontend
npm start
```

## 🎯 API Usage Examples

### Complete Image-to-Amount Pipeline

```javascript
// Step 1: Extract text from medical bill image
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const ocrResponse = await fetch('http://localhost:3002/api/ocr-with-boxes', {
  method: 'POST',
  body: formData,
});

const ocrData = await ocrResponse.json();
console.log('OCR Result:', ocrData);

// Step 2: Run amount extraction on extracted text
const amountResponse = await fetch('http://localhost:3002/api/amount-extraction/pipeline', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text: ocrData.fullText }),
});

const amountData = await amountResponse.json();
console.log('Amount Extraction Result:', amountData);

// Combine results
const finalResult = {
  ocr: ocrData,
  amounts: amountData
};
```

### Direct Text Processing

```javascript
const response = await fetch('http://localhost:3002/api/amount-extraction/pipeline', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: `
      MEDICAL BILL
      Patient: John Doe
      Date: 2024-01-15
      
      Room Rent: 4,000.00
      Consultation: 500.00
      Medicine: 1,200.00
      
      Subtotal: 5,700.00
      Tax (18%): 1,026.00
      Grand Total: 6,726.00
      
      Amount Paid: 5,000.00
      Outstanding: 1,726.00
    `
  })
});

const result = await response.json();
console.log(result);
```

### Individual Step Processing

```javascript
// Step 1: Raw Token Extraction
const step1Response = await fetch('http://localhost:3002/api/amount-extraction/step1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text: "Total: 1500.00, Paid: 1000.00" }),
});

const step1Result = await step1Response.json();
console.log('Step 1 - Raw Tokens:', step1Result);

// Step 2: Amount Normalization
const step2Response = await fetch('http://localhost:3002/api/amount-extraction/step2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text: "Total: 1500.00, Paid: 1000.00" }),
});

const step2Result = await step2Response.json();
console.log('Step 2 - Normalized:', step2Result);

// Step 3: Context Classification
const step3Response = await fetch('http://localhost:3002/api/amount-extraction/step3', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text: "Total: 1500.00, Paid: 1000.00" }),
});

const step3Result = await step3Response.json();
console.log('Step 3 - Classified:', step3Result);

// Step 4: Final Output
const step4Response = await fetch('http://localhost:3002/api/amount-extraction/step4', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text: "Total: 1500.00, Paid: 1000.00" }),
});

const step4Result = await step4Response.json();
console.log('Step 4 - Final Output:', step4Result);
```

### Frontend Integration Example

```javascript
// React component example
import React, { useState } from 'react';

function MedicalBillProcessor() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    setFile(event.target.files[0]);
  };

  const processImage = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: OCR processing
      const formData = new FormData();
      formData.append('image', file);

      const ocrResponse = await fetch('http://localhost:3002/api/ocr-with-boxes', {
        method: 'POST',
        body: formData,
      });

      const ocrData = await ocrResponse.json();

      if (!ocrResponse.ok) {
        throw new Error(ocrData.message || 'OCR processing failed');
      }

      // Step 2: Amount extraction
      const amountResponse = await fetch('http://localhost:3002/api/amount-extraction/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: ocrData.fullText }),
      });

      const amountData = await amountResponse.json();

      if (!amountResponse.ok) {
        throw new Error(amountData.message || 'Amount extraction failed');
      }

      // Combine results
      setResult({
        ocr: ocrData,
        amounts: amountData
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} accept="image/*" />
      <button onClick={processImage} disabled={!file || loading}>
        {loading ? 'Processing...' : 'Process Image'}
      </button>
      
      {error && <div style={{color: 'red'}}>Error: {error}</div>}
      
      {result && (
        <div>
          <h3>OCR Results:</h3>
          <pre>{JSON.stringify(result.ocr, null, 2)}</pre>
          
          <h3>Amount Extraction Results:</h3>
          <pre>{JSON.stringify(result.amounts, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default MedicalBillProcessor;
```

## 🏷️ Amount Classification Types

The service classifies amounts into the following categories:

| Type | Description | Examples |
|------|-------------|----------|
| `total_bill` | Total amount, grand total, bill total | "Grand Total", "Bill Amount", "Final Amount" |
| `paid` | Amount paid, payment received | "Amount Paid", "Payment Received", "Paid Amount" |
| `due` | Outstanding balance, amount due | "Outstanding", "Balance Due", "Remaining Amount" |
| `discount` | Discount amount, reduction | "Discount", "Off Amount", "Reduction" |
| `tax` | Tax amount, GST, VAT | "GST", "CGST", "SGST", "VAT", "Service Tax" |
| `subtotal` | Subtotal, base amount | "Subtotal", "Base Amount", "Before Tax" |
| `other` | Any other type not listed above | Custom amounts, fees, etc. |

## 🔄 Fallback Mechanisms

### LLM Unavailable Fallback

When the Gemini API is unavailable or not configured, the service automatically falls back to regex-based processing:

1. **Raw Token Extraction**: Uses regex patterns to find numeric values
2. **Currency Detection**: Pattern matching for currency symbols (₹, $, €, £)
3. **Context Classification**: Keyword-based classification using predefined patterns

### Error Handling

- **No Amounts Found**: Returns `{"status": "no_amounts_found", "reason": "..."}`
- **Processing Errors**: Returns error status with detailed messages
- **Service Unavailable**: Returns 503 status when services aren't initialized

## 🧪 Testing & Validation

### Postman Collection

For easy API testing, download the complete Postman collection:

**[📥 Download Postman Collection](https://drive.google.com/file/d/YOUR_GDRIVE_FILE_ID/view?usp=sharing)**

The collection includes:
- **Health Check**: Server status verification
- **OCR Endpoints**: Text extraction with bounding boxes
- **Amount Extraction**: Complete pipeline and individual steps
- **Sample Requests**: Pre-configured test cases with medical bill text
- **Response Examples**: Expected JSON responses for each endpoint
- **Test Scripts**: Automated validation and response time checks

### Health Check

```bash
# Check if the server is running
curl http://localhost:3002/health
```

### Test OCR Endpoint

```bash
# Test OCR with bounding boxes
curl -X POST http://localhost:3002/api/ocr-with-boxes \
  -F "image=@/path/to/medical-bill.jpg"
```

### Test Amount Extraction Endpoints

```bash
# Test complete pipeline
curl -X POST http://localhost:3002/api/amount-extraction/pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Total Bill: 1500.00, Paid: 1000.00, Due: 500.00"
  }'
```

### Individual Step Testing

```bash
# Test Step 1: Raw Token Extraction
curl -X POST http://localhost:3002/api/amount-extraction/step1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Bill Total: 1200.00"}'

# Test Step 2: Amount Normalization
curl -X POST http://localhost:3002/api/amount-extraction/step2 \
  -H "Content-Type: application/json" \
  -d '{"text": "Bill Total: 1200.00"}'

# Test Step 3: Context Classification
curl -X POST http://localhost:3002/api/amount-extraction/step3 \
  -H "Content-Type: application/json" \
  -d '{"text": "Bill Total: 1200.00"}'

# Test Step 4: Final Output Generation
curl -X POST http://localhost:3002/api/amount-extraction/step4 \
  -H "Content-Type: application/json" \
  -d '{"text": "Bill Total: 1200.00"}'
```

### Complete Pipeline Test

```bash
# Test the complete OCR + Amount Extraction pipeline
# Step 1: OCR
curl -X POST http://localhost:3002/api/ocr-with-boxes \
  -F "image=@/path/to/medical-bill.jpg" \
  -o ocr_result.json

# Step 2: Extract text from OCR result
TEXT=$(cat ocr_result.json | jq -r '.fullText')

# Step 3: Amount extraction
curl -X POST http://localhost:3002/api/amount-extraction/pipeline \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEXT\"}" \
  -o amount_result.json

# View results
echo "OCR Result:"
cat ocr_result.json | jq '.'

echo "Amount Extraction Result:"
cat amount_result.json | jq '.'
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for LLM features | - | No (fallback available) |
| `PORT` | Server port | 3002 | No |

### Service Configuration

The service can be configured with or without LLM support:

```typescript
// With LLM support
const service = new AmountExtractionService('your-gemini-api-key');

// Without LLM (regex fallback only)
const service = new AmountExtractionService();
```

## 📊 Performance & Reliability

### Confidence Scoring

- **Raw Token Extraction**: 0.0 - 1.0 based on text clarity and amount detection
- **Normalization**: 0.9 for successful normalization, 0.3 for failures
- **Classification**: 0.8 - 0.9 for high-confidence matches, 0.3 for "other" type

### Processing Speed

- **LLM Processing**: ~2-5 seconds per request
- **Regex Fallback**: ~100-500ms per request
- **Complete Pipeline**: ~3-8 seconds with LLM, ~1-2 seconds with regex

### Error Recovery

- Automatic fallback to regex when LLM fails
- Graceful degradation of features
- Detailed error logging and reporting

## 🔍 Monitoring & Logging

### Console Logging

The service provides detailed console logging for debugging:

```
🔍 Step 1: Extracting raw tokens from text using LLM...
🤖 LLM Response for Step 1: {...}
✅ Step 1 completed - Raw tokens extracted via LLM: [...]
🔧 Step 2: Normalizing amounts...
✅ Step 2 completed - Normalized amounts: [...]
🏷️ Step 3: Classifying amounts by context using LLM...
🤖 LLM Response for Step 3: {...}
✅ Step 3 completed - Classified amounts via LLM: [...]
📋 Step 4: Generating final output...
✅ Step 4 completed - Final output generated
✅ Complete pipeline executed successfully
```

### Error Logging

```
❌ Step 1 LLM failed, falling back to regex: Error message
⚠️ LLM not available, falling back to regex extraction...
❌ Pipeline execution failed: Error message
```

## 🚀 Future Enhancements

### Frontend Integration (Planned)

The current frontend implementation provides basic integration with the amount extraction service. Future enhancements include:

#### Enhanced UI Components
- **Real-time Processing Status**: Live updates during each pipeline step
- **Step-by-Step Visualization**: Interactive display of each processing step
- **Confidence Indicators**: Visual confidence scores for each extracted amount
- **Amount Validation**: User interface for validating and correcting extracted amounts

#### Advanced Features
- **Batch Processing**: Upload multiple documents for batch amount extraction
- **Export Functionality**: Export extracted amounts to CSV, Excel, or PDF
- **Amount History**: Track and compare amounts across different documents
- **Custom Classification**: Allow users to define custom amount types

#### User Experience Improvements
- **Drag & Drop Interface**: Enhanced file upload with preview
- **Mobile Optimization**: Responsive design for mobile devices
- **Offline Mode**: Basic functionality without internet connection
- **Keyboard Shortcuts**: Quick actions for power users

#### Integration Features
- **API Key Management**: Frontend interface for managing Gemini API keys
- **Service Configuration**: UI for configuring processing parameters
- **Error Recovery**: User-friendly error messages and recovery options
- **Performance Metrics**: Display processing times and accuracy metrics

### Additional OCR Endpoints (Future Enhancements)

#### Simple OCR (Text Only)
```http
POST /api/ocr
Content-Type: multipart/form-data

FormData: image (file)
```

#### Medical Bill Extraction (Complete Pipeline)
```http
POST /api/extract-medical-bill
Content-Type: multipart/form-data

FormData: image (file)
```

#### Direct Text Processing
```http
POST /api/extract-medical-bill-text
Content-Type: application/json

{
  "text": "Medical bill text to process..."
}
```

### Backend Enhancements (Planned)

#### Advanced AI Features
- **Multi-language Support**: Support for multiple languages in document processing
- **Custom Model Training**: Fine-tune models for specific document types
- **Confidence Calibration**: Improved confidence scoring algorithms
- **Context Understanding**: Better understanding of document structure and context

#### Performance Optimizations
- **Caching Layer**: Cache processed results for similar documents
- **Parallel Processing**: Process multiple documents simultaneously
- **Streaming Responses**: Stream results as they become available
- **Database Integration**: Store and retrieve processed documents

#### Security & Compliance
- **Data Encryption**: Encrypt sensitive financial data
- **Audit Logging**: Comprehensive audit trails for compliance
- **Access Control**: Role-based access to different features
- **Data Retention**: Configurable data retention policies

## 🤝 Contributing

### Development Setup

1. **Clone the Repository**
```bash
git clone <repository-url>
cd plum
```

2. **Install Dependencies**
```bash
cd backend
npm install
```

3. **Set Up Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run Development Server**
```bash
npm run dev
```

### Code Structure

```
plum/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── amount-extraction.service.ts    # Main service implementation
│   │   │   ├── ai.service.ts                   # AI service integration
│   │   │   ├── ocr.service.ts                  # OCR service adapter
│   │   │   └── medical-bill.service.ts         # Medical bill processor
│   │   ├── controllers/
│   │   │   └── amount-extraction.controller.ts # API controller
│   │   ├── interfaces/
│   │   │   ├── medical-bill.interfaces.ts      # Type definitions
│   │   │   └── ocr.interfaces.ts               # OCR interfaces
│   │   └── ...
│   ├── ocr-server.ts                           # Main server file
│   ├── package.json                            # Dependencies
│   └── .env                                    # Environment variables
├── frontend/
│   ├── index.html                              # Main frontend file
│   ├── public/                                 # Static assets
│   └── README.md                               # Frontend documentation
└── README.md                                   # This file
```

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Development Workflow

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
3. **Test your changes**
```bash
npm test
npm run lint
```

4. **Commit your changes**
```bash
git add .
git commit -m "Add your feature description"
```

5. **Push and create a pull request**
```bash
git push origin feature/your-feature-name
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Troubleshooting

### Common Issues

1. **Server Not Starting**
   - Check if port 3002 is available
   - Verify Node.js version (18+ required)
   - Check environment variables

2. **OCR Processing Fails**
   - Ensure image file is valid (JPG, PNG, etc.)
   - Check file size limits
   - Verify PaddleOCR installation

3. **AI Processing Errors**
   - Verify Gemini API key is valid
   - Check API quota limits
   - System will fallback to regex processing

4. **Frontend Connection Issues**
   - Ensure backend is running on port 3002
   - Check CORS settings
   - Verify network connectivity

### Debugging

```bash
# Check server status
curl http://localhost:3002/health

# View server logs
cd backend
npm run dev

# Test individual components
curl -X POST http://localhost:3002/api/amount-extraction/step1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Test: 100.00"}'
```

### Getting Help

1. Check the console logs for detailed error messages
2. Verify your Gemini API key is correctly configured
3. Ensure the backend server is running on port 3002
4. Test with the provided sample text to verify functionality
5. Review the troubleshooting section above

## 🔗 Related Documentation

- [Architecture Diagrams](./architecture-diagram.md)
- [Frontend Integration Guide](./frontend/README.md)
- [API Reference](./API_REFERENCE.md)
- [Medical Bill Processing API](./README.md)
