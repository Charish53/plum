# Problem Statement 8: AI-Powered Amount Detection in Medical Documents

A sophisticated 4-step pipeline for extracting, normalizing, and classifying monetary amounts from medical bills and financial documents using LLM (Large Language Model) integration with regex fallback mechanisms.

## 🚀 Overview

The Amount Extraction Service is a comprehensive solution that processes text from medical bills and financial documents to extract, normalize, and classify monetary amounts. It uses Google's Gemini AI for intelligent processing with robust fallback mechanisms to ensure reliability.

## 🏗️ Architecture

### 4-Step Pipeline

1. **Step 1: Raw Token Extraction** - Extract numeric tokens and currency hints
2. **Step 2: Amount Normalization** - Correct OCR errors and normalize values
3. **Step 3: Context Classification** - Classify amounts by their context (total, paid, due, etc.)
4. **Step 4: Final Output Generation** - Generate structured output with source tracking

### Core Components

- **AmountExtractionService**: Main service class implementing the 4-step pipeline
- **AmountExtractionController**: Express.js controller handling API endpoints
- **AI Integration**: Google Gemini 2.0 Flash model for intelligent processing
- **Fallback Mechanisms**: Regex-based processing when LLM is unavailable

## 📋 API Endpoints

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

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
# or
bun install
```

2. **Environment Configuration**
Create a `.env` file in the backend directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3002
```

3. **Start the Server**
```bash
npm start
# or
bun start
```

The server will start on `http://localhost:3002`

### Health Check

```http
GET /health
```

## 🎯 Usage Examples

### Basic Text Processing

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

### Integration with Medical Bill Processing

```javascript
// First extract text from image
const billResponse = await fetch('http://localhost:3002/api/extract-medical-bill', {
  method: 'POST',
  body: formData, // Contains image file
});

const billData = await billResponse.json();

// Then run amount extraction on extracted text
const amountResponse = await fetch('http://localhost:3002/api/amount-extraction/pipeline', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text: billData.extractedText }),
});

const amountData = await amountResponse.json();
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

## 🧪 Testing

### Test with Sample Text

```bash
curl -X POST http://localhost:3002/api/amount-extraction/pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Total Bill: 1500.00, Paid: 1000.00, Due: 500.00"
  }'
```

### Individual Step Testing

```bash
# Test Step 1
curl -X POST http://localhost:3002/api/amount-extraction/step1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Bill Total: 1200.00"}'

# Test Step 2
curl -X POST http://localhost:3002/api/amount-extraction/step2 \
  -H "Content-Type: application/json" \
  -d '{"text": "Bill Total: 1200.00"}'

# Test Step 3
curl -X POST http://localhost:3002/api/amount-extraction/step3 \
  -H "Content-Type: application/json" \
  -d '{"text": "Bill Total: 1200.00"}'

# Test Step 4
curl -X POST http://localhost:3002/api/amount-extraction/step4 \
  -H "Content-Type: application/json" \
  -d '{"text": "Bill Total: 1200.00"}'
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
backend/src/
├── services/
│   ├── amount-extraction.service.ts    # Main service implementation
│   └── ai.service.ts                   # AI service integration
├── controllers/
│   └── amount-extraction.controller.ts # API controller
├── interfaces/
│   ├── medical-bill.interfaces.ts      # Type definitions
│   └── ocr.interfaces.ts               # OCR interfaces
└── ...
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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the console logs for detailed error messages
2. Verify your Gemini API key is correctly configured
3. Ensure the backend server is running on port 3002
4. Test with the provided sample text to verify functionality

## 🔗 Related Documentation

- [Medical Bill Processing API](./README.md)
- [OCR Service Documentation](./OCR_README.md)
- [Frontend Integration Guide](./frontend/README.md)
- [API Reference](./API_REFERENCE.md)
