// Medical Bill specific interfaces

export interface ClinicInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface PatientInfo {
  name?: string;
  contact?: string;
  id?: string;
  age?: string;
  gender?: string;
}

export interface BillInfo {
  date?: string;
  time?: string;
  bill_number?: string;
  doctor_name?: string;
  referrer?: string;
}

export interface Service {
  item_number?: string;
  service_name?: string;
  rate?: number;
  quantity?: number;
  amount?: number;
  description?: string;
}

export interface PaymentSummary {
  total_billed?: number;
  total_payable?: number;
  amount_received?: number;
  payment_method?: string;
  payment_date?: string;
  payment_time?: string;
}

export interface MedicalBillData {
  clinic_info?: ClinicInfo;
  patient_info?: PatientInfo;
  bill_info?: BillInfo;
  services?: Service[];
  payment_summary?: PaymentSummary;
}

// Interface for medical bill extraction
export interface IMedicalBillExtractor {
  extract(ocrText: string): Promise<MedicalBillData>;
}

// Interface for medical bill validation
export interface IMedicalBillValidator {
  validate(data: MedicalBillData): boolean;
}

// Interface for medical bill template
export interface IMedicalBillTemplate {
  generatePrompt(ocrText: string): string;
}
