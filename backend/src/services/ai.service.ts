// AI Service implementation following Single Responsibility Principle (SRP)

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { IAIService } from '../interfaces/ocr.interfaces';
import type { IRetryStrategy } from '../interfaces/ocr.interfaces';
import type { MedicalBillData } from '../interfaces/medical-bill.interfaces';

export class GeminiAIService implements IAIService {
  private genAI: GoogleGenerativeAI;
  private retryStrategy: IRetryStrategy;

  constructor(apiKey: string, retryStrategy: IRetryStrategy) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.retryStrategy = retryStrategy;
  }

  async processText(text: string): Promise<MedicalBillData> {
    const prompt = this.createMedicalBillPrompt(text);
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    console.log('🤖 Calling Gemini API...');
    console.log('📝 Input text length:', text.length);
    console.log('📝 Input text preview:', text.substring(0, 200) + '...');
    
    return await this.retryStrategy.execute(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      console.log('🤖 Gemini API Response received!');
      console.log('🤖 Response length:', responseText.length);
      console.log('🤖 Gemini Response:', responseText);

      const parsedData = this.parseResponse(responseText);
      console.log('📊 Parsed Medical Bill Data:', JSON.stringify(parsedData, null, 2));
      
      return parsedData;
    }, 3);
  }

  private createMedicalBillPrompt(ocrText: string): string {
    return `You are a medical bill data extraction expert. Extract structured information from the following OCR text and return it as a JSON object.

OCR Text:
${ocrText}

Extract the following information and return as JSON:

{
  "clinic_info": {
    "name": "clinic/hospital name",
    "address": "full address",
    "phone": "phone number",
    "email": "email if mentioned",
    "website": "website if mentioned"
  },
  "patient_info": {
    "name": "patient name",
    "contact": "patient contact info",
    "id": "patient ID if mentioned",
    "age": "patient age if mentioned",
    "gender": "patient gender if mentioned"
  },
  "bill_info": {
    "date": "bill date",
    "time": "bill time if mentioned",
    "bill_number": "bill/invoice number",
    "doctor_name": "doctor name",
    "referrer": "referring doctor if mentioned"
  },
  "services": [
    {
      "item_number": "item number if mentioned",
      "service_name": "name of the service/procedure",
      "rate": rate_per_service,
      "quantity": quantity_if_mentioned,
      "amount": total_amount_for_this_service,
      "description": "any additional details about this service"
    }
  ],
  "payment_summary": {
    "total_billed": total_bill_amount,
    "total_payable": payable_amount_if_different,
    "amount_received": received_amount_if_mentioned,
    "payment_method": "payment method if mentioned",
    "payment_date": "payment date if mentioned",
    "payment_time": "payment time if mentioned"
  }
}

IMPORTANT: For every amount found, extract the exact entity description from the surrounding text. Don't use predefined categories - use what's actually written in the bill.

Examples:
- "ROOM RENT 4,000.00" → entity: "ROOM RENT"
- "Bill Amount 15,143.54" → entity: "Bill Amount"  
- "Received Rs.420 by Cash" → entity: "Amount Received"
- "Refundable Deposit Rs.5000" → entity: "Refundable Deposit"

Return ONLY the JSON object.
`;
  }

  private parseResponse(responseText: string): MedicalBillData {
    // Parse JSON response
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }
    
    const medicalBillData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    console.log('✅ Medical bill data extracted successfully');
    return medicalBillData;
  }
}
