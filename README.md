# AI-Powered Amount Detection in Medical Documents

**Demo Video Link:** [Link](https://drive.google.com/file/d/1p54qc8BZRJKKfnxrTssmX1CkQ9vY5nTw/view?usp=sharing)

**Google drive Link:** [Link](https://drive.google.com/drive/u/1/folders/12d90aM-Ps-6QFfSC_UupxHyFSlByxwrC)

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

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Charish53/plum.git
   cd plum
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend directory:
   ```bash
   # Create .env file
   touch .env
   ```
   
   Add the following environment variables to `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Server Configuration
   PORT=3002
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   
   # File Upload Configuration
   MAX_FILE_SIZE=10MB
   ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf
   
   # Optional: Enable debug logging
   DEBUG=true
   ```
   

4. **Start the Backend Server:**
   ```bash
   npm run dev
   ```

5. **Frontend Setup:**
   ```bash
   cd frontend
   npm start
   ```

6. **Access the Application:**
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

## Sample Example

### Input Image
![Sample Medical Bill](assets/bill-copy.png)

### Step 1: OCR Text Extraction
**Endpoint:** `POST http://localhost:3002/api/ocr-with-boxes`

**Input Text:**
```
Docpulse Clinic
718HarsaPlazaAbove Med
DocPulse Clinic JP Nagar 6sh Phase,BangaloreS60078
08042108688
manishkrverma5gmail.com
www.docp.se.com
NamerContact: Adarsh/09591027967 ID 100007 AgelSex: 1
Date: 19/09/201609:16AM Bills 10001 De/Referrer: Harish Kumar
BimReceipts
SLNO Particulars Charges Quantity Amount
1 Consultation-Or.Harish Kumar 200 1 200
2 Compkete Blcod Count 220 1 220
Four Hundred and Twenty Only Total Billed 420
Payable 420
19/0/201609:17AM-Receed Rs.420by Cash) as Payment
Authorized Signatory
Manish Kapoor
Powered by DocPulse Software -wwwdocpulse.com
```

### Step 2: Amount Extraction Pipeline
**Endpoint:** `POST http://localhost:3002/api/amount-extraction/pipeline`

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
        "value": 420,
        "source": "text: '0 1 220\nFour Hundred and Twenty Only Total Billed 420\nPayable 420\n19/0/201609:17AM-Receed Rs.420by Cash'"
      },
      {
        "type": "total_bill",
        "value": 420,
        "source": "text: '0 1 220\nFour Hundred and Twenty Only Total Billed 420\nPayable 420\n19/0/201609:17AM-Receed Rs.420by Cash'"
      },
      {
        "type": "paid",
        "value": 420,
        "source": "text: '0 1 220\nFour Hundred and Twenty Only Total Billed 420\nPayable 420\n19/0/201609:17AM-Receed Rs.420by Cash'"
      },
      {
        "type": "other",
        "value": 200,
        "source": "text: 'es Quantity Amount\n1 Consultation-Or.Harish Kumar 200 1 200\n2 Compkete Blcod Count 220 1 220\nFour Hundr'"
      },
      {
        "type": "other",
        "value": 200,
        "source": "text: 'es Quantity Amount\n1 Consultation-Or.Harish Kumar 200 1 200\n2 Compkete Blcod Count 220 1 220\nFour Hundr'"
      },
      {
        "type": "other",
        "value": 220,
        "source": "text: '-Or.Harish Kumar 200 1 200\n2 Compkete Blcod Count 220 1 220\nFour Hundred and Twenty Only Total Billed 4'"
      },
      {
        "type": "other",
        "value": 220,
        "source": "text: '-Or.Harish Kumar 200 1 200\n2 Compkete Blcod Count 220 1 220\nFour Hundred and Twenty Only Total Billed 4'"
      }
    ],
    "status": "ok"
  }
}
```

## Demo

[Click here to view the demo video](https://drive.google.com/file/d/1p54qc8BZRJKKfnxrTssmX1CkQ9vY5nTw/view?usp=sharing)

## License

This project is part of the AI-Powered Amount Detection system for medical document processing.
