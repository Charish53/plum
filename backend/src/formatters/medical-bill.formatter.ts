// Medical Bill Formatter implementation following Single Responsibility Principle (SRP)

import type { IDataFormatter } from '../interfaces/ocr.interfaces';
import type { MedicalBillData } from '../interfaces/medical-bill.interfaces';

export class MedicalBillHTMLFormatter implements IDataFormatter {
  format(data: MedicalBillData): string {
    return this.displayMedicalBillTable(data);
  }

  private displayMedicalBillTable(data: MedicalBillData): string {
    let tableHTML = `
    <div class="medical-bill-container">
      <h2>🏥 Medical Bill Analysis</h2>
      
      <div class="bill-section">
        <h3>🏥 Clinic Information</h3>
        <table class="bill-table">
          <tr><td><strong>Name:</strong></td><td>${data.clinic_info?.name || 'N/A'}</td></tr>
          <tr><td><strong>Address:</strong></td><td>${data.clinic_info?.address || 'N/A'}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${data.clinic_info?.phone || 'N/A'}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${data.clinic_info?.email || 'N/A'}</td></tr>
          <tr><td><strong>Website:</strong></td><td>${data.clinic_info?.website || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="bill-section">
        <h3>👤 Patient Information</h3>
        <table class="bill-table">
          <tr><td><strong>Name:</strong></td><td>${data.patient_info?.name || 'N/A'}</td></tr>
          <tr><td><strong>Contact:</strong></td><td>${data.patient_info?.contact || 'N/A'}</td></tr>
          <tr><td><strong>ID:</strong></td><td>${data.patient_info?.id || 'N/A'}</td></tr>
          <tr><td><strong>Age:</strong></td><td>${data.patient_info?.age || 'N/A'}</td></tr>
          <tr><td><strong>Gender:</strong></td><td>${data.patient_info?.gender || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="bill-section">
        <h3>📋 Bill Information</h3>
        <table class="bill-table">
          <tr><td><strong>Date:</strong></td><td>${data.bill_info?.date || 'N/A'}</td></tr>
          <tr><td><strong>Time:</strong></td><td>${data.bill_info?.time || 'N/A'}</td></tr>
          <tr><td><strong>Bill Number:</strong></td><td>${data.bill_info?.bill_number || 'N/A'}</td></tr>
          <tr><td><strong>Doctor:</strong></td><td>${data.bill_info?.doctor_name || 'N/A'}</td></tr>
          <tr><td><strong>Referrer:</strong></td><td>${data.bill_info?.referrer || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="bill-section">
        <h3>🩺 Services</h3>
        <table class="bill-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Service Name</th>
              <th>Rate</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (data.services && data.services.length > 0) {
      data.services.forEach((service) => {
        tableHTML += `
          <tr>
            <td>${service.item_number || 'N/A'}</td>
            <td><strong>${service.service_name || 'N/A'}</strong></td>
            <td>₹${service.rate || 0}</td>
            <td>${service.quantity || 1}</td>
            <td><strong>₹${service.amount || 0}</strong></td>
            <td>${service.description || 'N/A'}</td>
          </tr>
        `;
      });
    } else {
      tableHTML += '<tr><td colspan="6">No services found</td></tr>';
    }

    tableHTML += `
          </tbody>
        </table>
      </div>

      <div class="bill-section">
        <h3>💳 Payment Summary</h3>
        <table class="bill-table">
          <tr><td><strong>Total Billed:</strong></td><td>₹${data.payment_summary?.total_billed || 'N/A'}</td></tr>
          <tr><td><strong>Total Payable:</strong></td><td>₹${data.payment_summary?.total_payable || 'N/A'}</td></tr>
          <tr><td><strong>Amount Received:</strong></td><td>${data.payment_summary?.amount_received || 'N/A'}</td></tr>
          <tr><td><strong>Payment Method:</strong></td><td>${data.payment_summary?.payment_method || 'N/A'}</td></tr>
          <tr><td><strong>Payment Date:</strong></td><td>${data.payment_summary?.payment_date || 'N/A'}</td></tr>
          <tr><td><strong>Payment Time:</strong></td><td>${data.payment_summary?.payment_time || 'N/A'}</td></tr>
        </table>
      </div>

    </div>

    <style>
      .medical-bill-container {
        font-family: Arial, sans-serif;
        max-width: 1000px;
        margin: 20px auto;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      
      .bill-section {
        margin-bottom: 25px;
        padding: 20px;
        background-color: white;
        border-radius: 8px;
        border-left: 4px solid #007bff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .bill-section h3 {
        margin-top: 0;
        color: #007bff;
        border-bottom: 2px solid #e9ecef;
        padding-bottom: 10px;
      }
      
      .bill-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
      }
      
      .bill-table th,
      .bill-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
      }
      
      .bill-table th {
        background-color: #f8f9fa;
        font-weight: bold;
        color: #495057;
      }
      
      .bill-table tr:hover {
        background-color: #f5f5f5;
      }
      
      .bill-table td:first-child {
        font-weight: bold;
        color: #495057;
        width: 30%;
      }
      
      .bill-table td:last-child {
        color: #6c757d;
      }
      
      h2 {
        text-align: center;
        color: #007bff;
        margin-bottom: 30px;
        font-size: 2.5em;
      }
      
      .bill-section h3 {
        font-size: 1.3em;
        margin-bottom: 15px;
      }
    </style>
    `;

    return tableHTML;
  }
}
