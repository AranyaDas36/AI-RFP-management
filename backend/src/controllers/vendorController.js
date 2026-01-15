const Vendor = require('../models/Vendor');

class VendorController {
  /**
   * Create a new vendor
   */
  async createVendor(req, res) {
    try {
      const { name, email, company, notes } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const vendor = new Vendor({
        name,
        email,
        company: company || '',
        notes: notes || '',
      });

      await vendor.save();

      res.status(201).json(vendor);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Vendor with this email already exists' });
      }
      console.error('Error creating vendor:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all vendors
   */
  async getAllVendors(req, res) {
    try {
      const vendors = await Vendor.find().sort({ name: 1 });

      res.json(vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new VendorController();
