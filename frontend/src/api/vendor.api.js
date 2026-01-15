import client from './client';

export const vendorApi = {
  // Create a new vendor
  createVendor: async (vendorData) => {
    const response = await client.post('/api/vendors', vendorData);
    return response.data;
  },

  // Get all vendors
  getAllVendors: async () => {
    const response = await client.get('/api/vendors');
    return response.data;
  },
};
