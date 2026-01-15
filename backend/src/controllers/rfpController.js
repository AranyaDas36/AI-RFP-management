const RFP = require('../models/RFP');
const Vendor = require('../models/Vendor');
const Proposal = require('../models/Proposal');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

class RFPController {
  /**
   * Create a new RFP from natural language prompt
   */
  async createRFP(req, res) {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: 'Prompt is required and must be a non-empty string' });
      }

      // Use AI to structure the RFP
      const structuredData = await aiService.structureRFP(prompt);

      // Generate title from prompt (first 100 chars)
      const title = prompt.substring(0, 100).trim();

      const rfp = new RFP({
        title,
        rawPrompt: prompt,
        structuredData,
        status: 'draft',
      });

      await rfp.save();
      await rfp.populate('vendorsSentTo');

      res.status(201).json(rfp);
    } catch (error) {
      console.error('Error creating RFP:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all RFPs
   */
  async getAllRFPs(req, res) {
    try {
      const rfps = await RFP.find()
        .populate('vendorsSentTo')
        .sort({ createdAt: -1 });

      res.json(rfps);
    } catch (error) {
      console.error('Error fetching RFPs:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get a single RFP by ID
   */
  async getRFPById(req, res) {
    try {
      const { id } = req.params;

      const rfp = await RFP.findById(id).populate('vendorsSentTo');

      if (!rfp) {
        return res.status(404).json({ error: 'RFP not found' });
      }

      res.json(rfp);
    } catch (error) {
      console.error('Error fetching RFP:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Send RFP to vendors
   */
  async sendRFP(req, res) {
    try {
      const { id } = req.params;
      const { vendorIds } = req.body;

      if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
        return res.status(400).json({ error: 'vendorIds array is required' });
      }

      const rfp = await RFP.findById(id);
      if (!rfp) {
        return res.status(404).json({ error: 'RFP not found' });
      }

      // Send emails
      const results = await emailService.sendRFP(rfp, vendorIds);

      // Update RFP
      rfp.vendorsSentTo = vendorIds;
      rfp.status = 'sent';
      await rfp.save();

      await rfp.populate('vendorsSentTo');

      res.json({
        rfp,
        emailResults: results,
        message: 'RFP sent successfully',
      });
    } catch (error) {
      console.error('Error sending RFP:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get proposals for an RFP
   */
  async getRFPProposals(req, res) {
    try {
      const { id } = req.params;

      const rfp = await RFP.findById(id);
      if (!rfp) {
        return res.status(404).json({ error: 'RFP not found' });
      }

      const proposals = await Proposal.find({ rfp: id })
        .populate('vendor')
        .sort({ receivedAt: -1 });

      res.json(proposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Evaluate proposals for an RFP
   */
  async evaluateRFP(req, res) {
    try {
      const { id } = req.params;

      const rfp = await RFP.findById(id);
      if (!rfp) {
        return res.status(404).json({ error: 'RFP not found' });
      }

      const proposals = await Proposal.find({ rfp: id }).populate('vendor');

      if (proposals.length === 0) {
        return res.status(400).json({ error: 'No proposals found for this RFP' });
      }

      // Evaluate using AI
      const evaluation = await aiService.evaluateProposals(rfp, proposals);

      // Update RFP status
      rfp.status = 'evaluated';
      await rfp.save();

      res.json({
        rfp,
        evaluation,
        proposals: proposals.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0)),
      });
    } catch (error) {
      console.error('Error evaluating RFP:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new RFPController();
