const { getTransporter, getIMAPConfig } = require('../config/mail');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const Proposal = require('../models/Proposal');
const RFP = require('../models/RFP');
const Vendor = require('../models/Vendor');
const aiService = require('./aiService');

class EmailService {
  /**
   * Send RFP email to vendors
   */
  async sendRFP(rfp, vendorIds) {
    const transporter = getTransporter();
    const vendors = await Vendor.find({ _id: { $in: vendorIds } });
    
    if (vendors.length === 0) {
      throw new Error('No valid vendors found');
    }

    const emailBody = this.generateRFPEmailBody(rfp);
    const subject = `RFP: ${rfp.title} [Ref: ${rfp._id}]`;

    const results = [];
    
    for (const vendor of vendors) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: vendor.email,
          subject: subject,
          html: emailBody,
          text: this.generateRFPEmailText(rfp),
        });
        
        results.push({ vendor: vendor._id, success: true });
      } catch (error) {
        console.error(`Failed to send email to ${vendor.email}:`, error);
        results.push({ vendor: vendor._id, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Generate HTML email body for RFP
   */
  generateRFPEmailBody(rfp) {
    const itemsList = rfp.structuredData.items
      .map(item => `<li><strong>${item.name}</strong> - Quantity: ${item.quantity}${item.specs ? ` - ${item.specs}` : ''}</li>`)
      .join('');

    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Request for Proposal: ${rfp.title}</h2>
          <p>Dear Vendor,</p>
          <p>We are requesting a proposal for the following procurement:</p>
          
          <h3>Items Required:</h3>
          <ul>${itemsList}</ul>
          
          ${rfp.structuredData.budget ? `<p><strong>Budget:</strong> ${rfp.structuredData.budget}</p>` : ''}
          ${rfp.structuredData.deliveryTimeline ? `<p><strong>Delivery Timeline:</strong> ${rfp.structuredData.deliveryTimeline}</p>` : ''}
          ${rfp.structuredData.paymentTerms ? `<p><strong>Payment Terms:</strong> ${rfp.structuredData.paymentTerms}</p>` : ''}
          ${rfp.structuredData.warranty ? `<p><strong>Warranty Requirements:</strong> ${rfp.structuredData.warranty}</p>` : ''}
          
          <p><strong>Please reply to this email with your proposal including:</strong></p>
          <ul>
            <li>Itemized pricing</li>
            <li>Delivery timeline</li>
            <li>Payment terms</li>
            <li>Warranty information</li>
            <li>Any exceptions or special conditions</li>
          </ul>
          
          <p><strong>RFP Reference ID:</strong> ${rfp._id}</p>
          <p>Please include this reference ID in your reply subject line.</p>
          
          <p>Thank you for your interest.</p>
        </body>
      </html>
    `;
  }

  /**
   * Generate plain text email for RFP
   */
  generateRFPEmailText(rfp) {
    const itemsList = rfp.structuredData.items
      .map(item => `- ${item.name} (Quantity: ${item.quantity})${item.specs ? ` - ${item.specs}` : ''}`)
      .join('\n');

    return `
Request for Proposal: ${rfp.title}

Dear Vendor,

We are requesting a proposal for the following procurement:

Items Required:
${itemsList}

${rfp.structuredData.budget ? `Budget: ${rfp.structuredData.budget}\n` : ''}
${rfp.structuredData.deliveryTimeline ? `Delivery Timeline: ${rfp.structuredData.deliveryTimeline}\n` : ''}
${rfp.structuredData.paymentTerms ? `Payment Terms: ${rfp.structuredData.paymentTerms}\n` : ''}
${rfp.structuredData.warranty ? `Warranty Requirements: ${rfp.structuredData.warranty}\n` : ''}

Please reply to this email with your proposal including:
- Itemized pricing
- Delivery timeline
- Payment terms
- Warranty information
- Any exceptions or special conditions

RFP Reference ID: ${rfp._id}
Please include this reference ID in your reply subject line.

Thank you for your interest.
    `.trim();
  }

  /**
   * Fetch and process emails from IMAP inbox
   */
  async fetchEmails() {
    return new Promise((resolve, reject) => {
      const imap = new Imap(getIMAPConfig());
      const processedEmails = [];

      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            imap.end();
            return reject(err);
          }

          // Search for unread emails
          imap.search(['UNSEEN'], (err, results) => {
            if (err) {
              imap.end();
              return reject(err);
            }

            if (!results || results.length === 0) {
              imap.end();
              return resolve([]);
            }

            const fetch = imap.fetch(results, { bodies: '', struct: true });

            fetch.on('message', (msg, seqno) => {
              msg.on('body', (stream, info) => {
                simpleParser(stream, async (err, parsed) => {
                  if (err) {
                    console.error('Error parsing email:', err);
                    return;
                  }

                  try {
                    await this.processEmail(parsed);
                    processedEmails.push({
                      from: parsed.from?.text,
                      subject: parsed.subject,
                      processed: true,
                    });
                  } catch (error) {
                    console.error('Error processing email:', error);
                    processedEmails.push({
                      from: parsed.from?.text,
                      subject: parsed.subject,
                      processed: false,
                      error: error.message,
                    });
                  }
                });
              });
            });

            fetch.once('end', () => {
              imap.end();
            });
          });
        });
      });

      imap.once('error', (err) => {
        reject(err);
      });

      imap.connect();

      // Resolve after a delay to allow emails to process
      setTimeout(() => {
        resolve(processedEmails);
      }, 5000);
    });
  }

  /**
   * Process a single email and create proposal if it matches an RFP
   */
  async processEmail(parsedEmail) {
    const emailBody = parsedEmail.text || parsedEmail.html || '';
    const fromEmail = parsedEmail.from?.value?.[0]?.address;
    const subject = parsedEmail.subject || '';
    const inReplyTo = parsedEmail.inReplyTo || '';
    const references = parsedEmail.references || [];

    if (!fromEmail) {
      throw new Error('No sender email found');
    }

    // Find vendor by email
    const vendor = await Vendor.findOne({ email: fromEmail });
    if (!vendor) {
      throw new Error(`Vendor not found for email: ${fromEmail}`);
    }

    // Try to find RFP by ID in subject or references
    let rfpId = null;
    
    // Extract RFP ID from subject (format: [Ref: <id>] or similar)
    const subjectMatch = subject.match(/\[Ref:\s*([a-f0-9]{24})\]/i) || 
                        subject.match(/RFP[:\s]+([a-f0-9]{24})/i);
    if (subjectMatch) {
      rfpId = subjectMatch[1];
    }

    // Check in-reply-to header
    if (!rfpId && inReplyTo) {
      // Try to extract from message ID or check references
      const replyMatch = inReplyTo.match(/([a-f0-9]{24})/i);
      if (replyMatch) {
        rfpId = replyMatch[1];
      }
    }

    // Check references array
    if (!rfpId && references && references.length > 0) {
      for (const ref of references) {
        const refMatch = ref.match(/([a-f0-9]{24})/i);
        if (refMatch) {
          rfpId = refMatch[1];
          break;
        }
      }
    }

    // If still no RFP ID, try to find by searching recent RFPs sent to this vendor
    if (!rfpId) {
      const recentRFP = await RFP.findOne({
        vendorsSentTo: vendor._id,
        status: { $in: ['sent', 'responses_received'] },
      }).sort({ createdAt: -1 });
      
      if (recentRFP) {
        rfpId = recentRFP._id.toString();
      }
    }

    if (!rfpId) {
      throw new Error('Could not determine RFP for this email');
    }

    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      throw new Error(`RFP not found: ${rfpId}`);
    }

    // Check if proposal already exists
    const existingProposal = await Proposal.findOne({
      rfp: rfp._id,
      vendor: vendor._id,
    });

    if (existingProposal) {
      // Update existing proposal
      existingProposal.rawEmailBody = emailBody;
      existingProposal.receivedAt = parsedEmail.date || new Date();
      
      // Re-parse with AI
      const extractedData = await aiService.parseVendorResponse(emailBody);
      existingProposal.extractedData = extractedData;
      
      await existingProposal.save();
    } else {
      // Create new proposal
      const extractedData = await aiService.parseVendorResponse(emailBody);
      
      const proposal = new Proposal({
        rfp: rfp._id,
        vendor: vendor._id,
        rawEmailBody: emailBody,
        extractedData,
        receivedAt: parsedEmail.date || new Date(),
      });
      
      await proposal.save();
    }

    // Update RFP status
    if (rfp.status === 'sent') {
      rfp.status = 'responses_received';
      await rfp.save();
    }
  }
}

module.exports = new EmailService();
