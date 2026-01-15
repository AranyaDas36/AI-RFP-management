import client from './client';

export const rfpApi = {
  // Create RFP from natural language prompt
  createRFP: async (prompt) => {
    const response = await client.post('/api/rfps', { prompt });
    return response.data;
  },

  // Get all RFPs
  getAllRFPs: async () => {
    const response = await client.get('/api/rfps');
    return response.data;
  },

  // Get single RFP by ID
  getRFPById: async (id) => {
    const response = await client.get(`/api/rfps/${id}`);
    return response.data;
  },

  // Send RFP to vendors
  sendRFP: async (id, vendorIds) => {
    const response = await client.post(`/api/rfps/${id}/send`, { vendorIds });
    return response.data;
  },

  // Get proposals for an RFP
  getRFPProposals: async (id) => {
    const response = await client.get(`/api/rfps/${id}/proposals`);
    return response.data;
  },

  // Evaluate proposals for an RFP
  evaluateRFP: async (id) => {
    const response = await client.post(`/api/rfps/${id}/evaluate`);
    return response.data;
  },
};
