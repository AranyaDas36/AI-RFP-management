import client from './client';

export const proposalApi = {
  // Fetch and process emails from inbox
  fetchEmails: async () => {
    const response = await client.post('/api/proposals/fetch-emails');
    return response.data;
  },
};
