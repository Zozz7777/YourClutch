const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send notification email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email text content
 * @returns {Promise<boolean>} - Success status
 */
async function sendNotification({ to, subject, html, text }) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 Email service not configured - notification would be sent to:', to);
      console.log('📧 Subject:', subject);
      console.log('📧 Content:', text || html);
      return true; // Mock success for development
    }

    const mailOptions = {
      from: `"Clutch Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Notification sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    return false;
  }
}

/**
 * Notify legal team about signed contract upload
 * @param {Object} contract - Contract data
 * @param {string} salesPersonEmail - Sales person email
 * @returns {Promise<boolean>} - Success status
 */
async function notifyLegalTeamSignedContract(contract, salesPersonEmail) {
  const subject = `📋 Signed Contract Ready for Review - ${contract._id}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">📋 New Signed Contract Ready for Review</h2>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e293b;">Contract Details</h3>
        <p><strong>Contract ID:</strong> ${contract._id}</p>
        <p><strong>Lead ID:</strong> ${contract.leadId}</p>
        <p><strong>Partner Type:</strong> ${contract.partnerType}</p>
        <p><strong>Contract Type:</strong> ${contract.contractType}</p>
        <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">SIGNED</span></p>
        <p><strong>Created:</strong> ${new Date(contract.createdAt).toLocaleDateString()}</p>
      </div>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h4 style="margin-top: 0; color: #92400e;">⚠️ Action Required</h4>
        <p>This contract has been signed by the partner and is now ready for legal review and approval.</p>
        <p>Please review the contract and either approve or decline it in the Legal section of the admin dashboard.</p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          <strong>Sales Contact:</strong> ${salesPersonEmail}<br>
          <strong>Review Deadline:</strong> Please review within 48 hours
        </p>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <a href="${process.env.ADMIN_URL || 'https://admin.yourclutch.com'}/legal" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Review Contract
        </a>
      </div>
    </div>
  `;

  const text = `
New Signed Contract Ready for Review

Contract ID: ${contract._id}
Lead ID: ${contract.leadId}
Partner Type: ${contract.partnerType}
Contract Type: ${contract.contractType}
Status: SIGNED
Created: ${new Date(contract.createdAt).toLocaleDateString()}

ACTION REQUIRED: This contract has been signed by the partner and is now ready for legal review and approval.

Please review the contract and either approve or decline it in the Legal section of the admin dashboard.

Sales Contact: ${salesPersonEmail}
Review Deadline: Please review within 48 hours

Review Contract: ${process.env.ADMIN_URL || 'https://admin.yourclutch.com'}/legal
  `;

  // Get legal team emails (in production, this would come from database)
  const legalTeamEmails = [
    process.env.LEGAL_TEAM_EMAIL || 'legal@yourclutch.com',
    process.env.EXECUTIVE_EMAIL || 'executive@yourclutch.com'
  ];

  const results = await Promise.all(
    legalTeamEmails.map(email => 
      sendNotification({ to: email, subject, html, text })
    )
  );

  return results.every(result => result);
}

/**
 * Notify sales person about contract decision
 * @param {Object} contract - Contract data
 * @param {string} decision - 'approved' or 'declined'
 * @param {string} reason - Reason for decline (if applicable)
 * @returns {Promise<boolean>} - Success status
 */
async function notifySalesPersonContractDecision(contract, decision, reason = '') {
  const isApproved = decision === 'approved';
  const subject = isApproved 
    ? `✅ Contract Approved - ${contract._id}` 
    : `❌ Contract Declined - ${contract._id}`;
  
  const statusColor = isApproved ? '#059669' : '#dc2626';
  const statusText = isApproved ? 'APPROVED' : 'DECLINED';
  const actionText = isApproved 
    ? 'Your contract has been approved and the partner has been created in the system.'
    : 'Your contract has been declined and requires attention.';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${statusColor};">${isApproved ? '✅' : '❌'} Contract ${statusText}</h2>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e293b;">Contract Details</h3>
        <p><strong>Contract ID:</strong> ${contract._id}</p>
        <p><strong>Lead ID:</strong> ${contract.leadId}</p>
        <p><strong>Partner Type:</strong> ${contract.partnerType}</p>
        <p><strong>Contract Type:</strong> ${contract.contractType}</p>
        <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
        <p><strong>Decision Date:</strong> ${new Date().toLocaleDateString()}</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>
      
      <div style="background: ${isApproved ? '#f0fdf4' : '#fef2f2'}; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusColor};">
        <h4 style="margin-top: 0; color: ${isApproved ? '#166534' : '#991b1b'};">${isApproved ? '✅' : '❌'} Decision</h4>
        <p>${actionText}</p>
        ${isApproved ? '<p>The partner can now access the partner portal and begin using our services.</p>' : ''}
        ${!isApproved ? '<p>Please review the feedback and consider resubmitting with corrections.</p>' : ''}
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <a href="${process.env.ADMIN_URL || 'https://admin.yourclutch.com'}/sales" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View in Sales Dashboard
        </a>
      </div>
    </div>
  `;

  const text = `
Contract ${statusText}

Contract ID: ${contract._id}
Lead ID: ${contract.leadId}
Partner Type: ${contract.partnerType}
Contract Type: ${contract.contractType}
Status: ${statusText}
Decision Date: ${new Date().toLocaleDateString()}
${reason ? `Reason: ${reason}` : ''}

${actionText}
${isApproved ? 'The partner can now access the partner portal and begin using our services.' : 'Please review the feedback and consider resubmitting with corrections.'}

View in Sales Dashboard: ${process.env.ADMIN_URL || 'https://admin.yourclutch.com'}/sales
  `;

  // Get sales person email (in production, this would come from database)
  const salesPersonEmail = process.env.SALES_EMAIL || 'sales@yourclutch.com';

  return await sendNotification({ to: salesPersonEmail, subject, html, text });
}

/**
 * Notify about new partner creation
 * @param {Object} partner - Partner data
 * @param {string} salesPersonEmail - Sales person email
 * @returns {Promise<boolean>} - Success status
 */
async function notifyNewPartnerCreated(partner, salesPersonEmail) {
  const subject = `🎉 New Partner Created - ${partner.name}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">🎉 New Partner Successfully Created</h2>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
        <h3 style="margin-top: 0; color: #166534;">Partner Details</h3>
        <p><strong>Partner ID:</strong> ${partner.partnerId}</p>
        <p><strong>Name:</strong> ${partner.name}</p>
        <p><strong>Type:</strong> ${partner.type}</p>
        <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">ACTIVE</span></p>
        <p><strong>Created:</strong> ${new Date(partner.createdAt).toLocaleDateString()}</p>
      </div>
      
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
        <h4 style="margin-top: 0; color: #1e293b;">Next Steps</h4>
        <p>The partner has been successfully created and can now:</p>
        <ul>
          <li>Access the partner portal</li>
          <li>Set up their account</li>
          <li>Begin using our services</li>
        </ul>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <a href="${process.env.ADMIN_URL || 'https://admin.yourclutch.com'}/partners" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Partner
        </a>
      </div>
    </div>
  `;

  const text = `
New Partner Successfully Created

Partner ID: ${partner.partnerId}
Name: ${partner.name}
Type: ${partner.type}
Status: ACTIVE
Created: ${new Date(partner.createdAt).toLocaleDateString()}

Next Steps:
The partner has been successfully created and can now:
- Access the partner portal
- Set up their account
- Begin using our services

View Partner: ${process.env.ADMIN_URL || 'https://admin.yourclutch.com'}/partners
  `;

  return await sendNotification({ to: salesPersonEmail, subject, html, text });
}

module.exports = {
  sendNotification,
  notifyLegalTeamSignedContract,
  notifySalesPersonContractDecision,
  notifyNewPartnerCreated
};
