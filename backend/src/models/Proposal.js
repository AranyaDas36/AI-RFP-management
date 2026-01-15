const mongoose = require('mongoose');

const itemBreakdownSchema = new mongoose.Schema({
  itemName: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
  notes: String,
}, { _id: false });

const proposalSchema = new mongoose.Schema({
  rfp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFP',
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  rawEmailBody: { type: String, required: true },
  extractedData: {
    totalPrice: { type: String, default: '' },
    itemBreakdown: [itemBreakdownSchema],
    deliveryTimeline: { type: String, default: '' },
    paymentTerms: { type: String, default: '' },
    warranty: { type: String, default: '' },
    exceptions: { type: String, default: '' },
  },
  aiScore: { type: Number, default: null },
  aiSummary: { type: String, default: '' },
  receivedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Proposal', proposalSchema);
