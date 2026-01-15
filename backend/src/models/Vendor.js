const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  company: { type: String, default: '' },
  notes: { type: String, default: '' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Vendor', vendorSchema);
