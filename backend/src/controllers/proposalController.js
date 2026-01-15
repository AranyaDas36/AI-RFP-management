const emailService = require('../services/emailService');

class ProposalController {
  /**
   * Fetch and process emails from inbox
   */
  async fetchEmails(req, res) {
    try {
      const results = await emailService.fetchEmails();

      res.json({
        message: 'Email fetch completed',
        processed: results.length,
        results,
      });
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ProposalController();
