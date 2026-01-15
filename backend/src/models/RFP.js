const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  specs: { type: String, default: '' },
}, { _id: false });

const rfpSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rawPrompt: { type: String, required: true },
  structuredData: {
    items: [itemSchema],
    budget: { type: String, default: '' },
    deliveryTimeline: { type: String, default: '' },
    paymentTerms: { type: String, default: '' },
    warranty: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'responses_received', 'evaluated'],
    default: 'draft',
  },
  vendorsSentTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('RFP', rfpSchema);
