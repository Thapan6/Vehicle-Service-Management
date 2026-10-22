/**
 * Centralized email templates for the AutoCare platform.
 * Design style: Modern, premium slate-blue and blue branding with table-based grids for data.
 */

const emailLayout = (title, content) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      color: #334155;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background-color: #0f172a;
      padding: 35px 30px;
      text-align: center;
      border-bottom: 4px solid #3b82f6;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .header p {
      color: #3b82f6;
      margin: 6px 0 0 0;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .content {
      padding: 40px 35px;
    }
    .content h2 {
      margin-top: 0;
      color: #0f172a;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .content p {
      line-height: 1.6;
      font-size: 15px;
      margin-bottom: 24px;
      color: #475569;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      display: inline-block;
      background-color: #3b82f6;
      color: #ffffff !important;
      padding: 14px 30px;
      text-decoration: none !important;
      font-weight: 600;
      border-radius: 8px;
      font-size: 15px;
      box-shadow: 0 4px 10px rgba(59, 130, 246, 0.35);
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      background-color: #f8fafc;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .details-table td {
      padding: 14px 18px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      color: #334155;
    }
    .details-table td.label {
      font-weight: 700;
      color: #475569;
      width: 35%;
    }
    .details-table tr:last-child td {
      border-bottom: none;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .invoice-table th {
      text-align: left;
      padding: 12px 14px;
      background-color: #f1f5f9;
      color: #475569;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      color: #334155;
    }
    .invoice-table tr:last-child td {
      border-bottom: 2px solid #cbd5e1;
    }
    .invoice-totals-table {
      width: 100%;
      margin-top: 15px;
    }
    .invoice-totals-table td {
      padding: 6px 0;
      font-size: 14px;
      text-align: right;
    }
    .invoice-totals-table td.label {
      color: #64748b;
      padding-right: 20px;
    }
    .invoice-totals-table tr.grand-total td {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-success {
      background-color: #dcfce7;
      color: #15803d;
    }
    .badge-warning {
      background-color: #fef9c3;
      color: #a16207;
    }
    .footer {
      background-color: #f8fafc;
      padding: 35px 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 0 0 10px 0;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>AutoCare</h1>
        <p>Service Management Platform</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p><strong>AutoCare Service Desk</strong><br>123 Auto Drive, Detroit, MI 48201</p>
        <p>This is an automated transactional message regarding your account or service. Replies to this mailbox are not monitored.</p>
        <p>&copy; ${new Date().getFullYear()} AutoCare. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * 1. Welcome Email
 */
export const getWelcomeTemplate = (name) => {
  const content = `
    <h2>Welcome to AutoCare, ${name}!</h2>
    <p>We are thrilled to welcome you to our premium vehicle service management platform. At AutoCare, we make vehicle maintenance completely transparent, convenient, and professional.</p>
    <p>Here is what you can do next with your new account:</p>
    <ul>
      <li><strong>Manage Your Garage:</strong> Register your vehicles' specifications and license plates.</li>
      <li><strong>Seamless Bookings:</strong> Schedule appointments for repairs, oil changes, or inspections.</li>
      <li><strong>Real-Time Monitoring:</strong> Watch your vehicle progress from check-in to completed repair.</li>
      <li><strong>Digital Invoices:</strong> View full breakdowns and process payments in seconds.</li>
    </ul>
    <div class="btn-container">
      <a href="http://localhost:3000/login" class="btn" target="_blank">Access Your Dashboard</a>
    </div>
    <p>If you have any questions or require support, please don't hesitate to reach out to our team.</p>
  `;
  return emailLayout('Welcome to AutoCare!', content);
};

/**
 * 2. Appointment Submitted Email
 */
export const getAppointmentSubmittedTemplate = (name, details) => {
  const content = `
    <h2>Appointment Request Received</h2>
    <p>Hello ${name},</p>
    <p>We have successfully received your service appointment request. Our service center team will review the details and confirm your approval shortly.</p>
    
    <table class="details-table">
      <tr>
        <td class="label">Vehicle</td>
        <td>${details.vehicleName} (${details.licensePlate})</td>
      </tr>
      <tr>
        <td class="label">Service Type</td>
        <td>${details.serviceType}</td>
      </tr>
      <tr>
        <td class="label">Date</td>
        <td>${details.date}</td>
      </tr>
      <tr>
        <td class="label">Preferred Time</td>
        <td>${details.time}</td>
      </tr>
      ${details.notes ? `<tr><td class="label">Customer Notes</td><td>${details.notes}</td></tr>` : ''}
      <tr>
        <td class="label">Current Status</td>
        <td><span class="badge badge-warning">Pending Approval</span></td>
      </tr>
    </table>
    
    <p>You can check the status of this booking at any time inside your portal.</p>
    <div class="btn-container">
      <a href="http://localhost:3000/appointments" class="btn" target="_blank">View Bookings</a>
    </div>
  `;
  return emailLayout('Service Request Submitted', content);
};

/**
 * 3. Appointment Approved Email
 */
export const getAppointmentApprovedTemplate = (name, details) => {
  const content = `
    <h2>Appointment Approved!</h2>
    <p>Hello ${name},</p>
    <p>Great news! Your service request has been reviewed and formally **Approved** by our Service Center staff. The next step is assigning a specialized technician to your vehicle.</p>
    
    <table class="details-table">
      <tr>
        <td class="label">Vehicle</td>
        <td>${details.vehicleName}</td>
      </tr>
      <tr>
        <td class="label">Service Type</td>
        <td>${details.serviceType}</td>
      </tr>
      <tr>
        <td class="label">Date</td>
        <td>${details.date}</td>
      </tr>
      <tr>
        <td class="label">Scheduled Time</td>
        <td>${details.time}</td>
      </tr>
      <tr>
        <td class="label">Status</td>
        <td><span class="badge badge-success">Approved</span></td>
      </tr>
    </table>
    
    <p>We look forward to servicing your vehicle. Please bring your vehicle in at the scheduled time.</p>
  `;
  return emailLayout('Service Request Approved', content);
};

/**
 * 4. Technician Assigned Email
 */
export const getTechnicianAssignedTemplate = (name, details) => {
  const content = `
    <h2>Technician Assigned</h2>
    <p>Hello ${name},</p>
    <p>A mechanic has been assigned to your vehicle. Repairs are scheduled to begin shortly.</p>
    
    <table class="details-table">
      <tr>
        <td class="label">Vehicle</td>
        <td>${details.vehicleName}</td>
      </tr>
      <tr>
        <td class="label">Service Type</td>
        <td>${details.serviceType}</td>
      </tr>
      <tr>
        <td class="label">Assigned Technician</td>
        <td><strong>${details.technicianName}</strong></td>
      </tr>
      <tr>
        <td class="label">Status</td>
        <td><span class="badge badge-success">Technician Assigned</span></td>
      </tr>
    </table>
    
    <p>We will keep you updated as work on your vehicle progresses.</p>
  `;
  return emailLayout('Technician Assigned - AutoCare', content);
};

/**
 * 5. Repair Completed Email
 */
export const getRepairCompletedTemplate = (name, details) => {
  const content = `
    <h2>Repair Work Completed!</h2>
    <p>Hello ${name},</p>
    <p>Your vehicle's repair work has been fully completed by your assigned technician. We are now preparing the final billing statement for your review.</p>
    
    <table class="details-table">
      <tr>
        <td class="label">Vehicle</td>
        <td>${details.vehicleName}</td>
      </tr>
      <tr>
        <td class="label">Service Type</td>
        <td>${details.serviceType}</td>
      </tr>
      <tr>
        <td class="label">Labor Hours</td>
        <td>${details.laborHours} hrs</td>
      </tr>
      <tr>
        <td class="label">Status</td>
        <td><span class="badge badge-success">Repair Completed</span></td>
      </tr>
    </table>

    <p>Once the Service Center processes and creates your invoice, you will receive another notification to process your payment in the Payment Hub.</p>
  `;
  return emailLayout('Repair Work Completed', content);
};

/**
 * 6. Invoice Generated Email
 */
export const getInvoiceGeneratedTemplate = (name, details) => {
  let partsListHtml = '';
  if (details.partsUsed && details.partsUsed.length > 0) {
    partsListHtml = details.partsUsed
      .map(part => `<tr><td>${part.name}</td><td>${part.quantity}</td><td>$${part.price.toFixed(2)}</td><td>$${(part.price * part.quantity).toFixed(2)}</td></tr>`)
      .join('');
  } else {
    partsListHtml = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; font-style: italic;">No parts required for this service.</td></tr>`;
  }

  const content = `
    <h2>Your Invoice is Ready</h2>
    <p>Hello ${name},</p>
    <p>The billing statement for invoice **#${details.invoiceId.substring(0, 8).toUpperCase()}** has been generated. Please review the itemized breakdown below:</p>
    
    <table class="invoice-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty/Hrs</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Labor Cost ($100/hr)</td>
          <td>${details.laborHours} hrs</td>
          <td>$100.00</td>
          <td>$${details.laborCost.toFixed(2)}</td>
        </tr>
        ${partsListHtml}
      </tbody>
    </table>

    <table class="invoice-totals-table">
      <tr>
        <td class="label">Parts Total:</td>
        <td style="width: 120px;">$${details.partsCost.toFixed(2)}</td>
      </tr>
      <tr>
        <td class="label">Labor Total:</td>
        <td>$${details.laborCost.toFixed(2)}</td>
      </tr>
      <tr>
        <td class="label">Tax (10%):</td>
        <td>$${details.tax.toFixed(2)}</td>
      </tr>
      <tr class="grand-total">
        <td class="label">Amount Due:</td>
        <td>$${details.totalAmount.toFixed(2)}</td>
      </tr>
    </table>

    <div class="btn-container" style="margin-top: 35px;">
      <a href="http://localhost:3000/payments" class="btn" target="_blank">Pay Invoice Online</a>
    </div>
  `;
  return emailLayout('AutoCare Invoice Ready', content);
};

/**
 * 7. Payment Successful Email
 */
export const getPaymentSuccessfulTemplate = (name, details) => {
  const content = `
    <h2>Payment Confirmed - Thank You!</h2>
    <p>Hello ${name},</p>
    <p>We have successfully processed your payment for invoice **#${details.invoiceId.substring(0, 8).toUpperCase()}**. Your account has been settled, and your vehicle is cleared for pickup!</p>
    
    <table class="details-table">
      <tr>
        <td class="label">Invoice Reference</td>
        <td>#${details.invoiceId}</td>
      </tr>
      <tr>
        <td class="label">Vehicle</td>
        <td>${details.vehicleName}</td>
      </tr>
      <tr>
        <td class="label">Amount Settled</td>
        <td><strong>$${details.amountPaid.toFixed(2)}</strong></td>
      </tr>
      <tr>
        <td class="label">Payment Date</td>
        <td>${details.paymentDate}</td>
      </tr>
      <tr>
        <td class="label">Payment Status</td>
        <td><span class="badge badge-success">Settled / Paid</span></td>
      </tr>
    </table>
    
    <p>We appreciate your business! Drive safely, and please let us know if there is anything else we can do for you.</p>
  `;
  return emailLayout('Payment Successful - AutoCare', content);
};
