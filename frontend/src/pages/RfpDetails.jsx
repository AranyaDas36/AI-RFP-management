import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { rfpApi } from '../api/rfp.api';
import { vendorApi } from '../api/vendor.api';
import { proposalApi } from '../api/proposal.api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import RfpStructuredView from '../components/rfp/RfpStructuredView';
import RfpStatusTimeline from '../components/rfp/RfpStatusTimeline';
import VendorList from '../components/vendor/VendorList';
import ProposalCard from '../components/proposal/ProposalCard';

const RfpDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rfpData, vendorsData, proposalsData] = await Promise.all([
        rfpApi.getRFPById(id),
        vendorApi.getAllVendors(),
        rfpApi.getRFPProposals(id).catch(() => []),
      ]);
      setRfp(rfpData);
      setVendors(vendorsData);
      setProposals(proposalsData);
      setSelectedVendors(rfpData.vendorsSentTo?.map(v => v._id || v) || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVendor = (vendorId) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSendRFP = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select at least one vendor');
      return;
    }

    try {
      setSending(true);
      setError(null);
      await rfpApi.sendRFP(id, selectedVendors);
      await loadData();
      alert('RFP sent successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleFetchEmails = async () => {
    try {
      setFetching(true);
      setError(null);
      const result = await proposalApi.fetchEmails();
      await loadData();
      alert(`Fetched ${result.processed} emails. ${result.results.filter(r => r.processed).length} processed successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  if (error && !rfp) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{rfp?.title}</h1>
        </div>
        <div className="flex gap-2">
          {rfp?.status === 'responses_received' && (
            <Link to={`/evaluation/${id}`}>
              <Button variant="primary">Evaluate Proposals</Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
            <RfpStatusTimeline status={rfp?.status} />
          </div>
        </div>
      </Card>

      <Card>
        <RfpStructuredView rfp={rfp} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select Vendors</h3>
              {rfp?.status === 'draft' && (
                <Link to="/vendors">
                  <Button variant="outline" size="sm">Manage Vendors</Button>
                </Link>
              )}
            </div>

            {vendors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No vendors available</p>
                <Link to="/vendors">
                  <Button variant="outline">Add Vendors</Button>
                </Link>
              </div>
            ) : (
              <>
                <VendorList
                  vendors={vendors}
                  selectedVendors={selectedVendors}
                  onToggleSelection={handleToggleVendor}
                  showCheckboxes={rfp?.status === 'draft'}
                />
                {rfp?.status === 'draft' && selectedVendors.length > 0 && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleSendRFP}
                      disabled={sending}
                      className="w-full"
                    >
                      {sending ? 'Sending...' : `Send RFP to ${selectedVendors.length} Vendor(s)`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Proposals</h3>
              {rfp?.status === 'sent' && (
                <Button
                  onClick={handleFetchEmails}
                  disabled={fetching}
                  variant="outline"
                  size="sm"
                >
                  {fetching ? 'Fetching...' : 'Fetch Vendor Replies'}
                </Button>
              )}
            </div>

            {proposals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {rfp?.status === 'sent'
                    ? 'No proposals received yet. Click "Fetch Vendor Replies" to check for emails.'
                    : 'No proposals yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <ProposalCard key={proposal._id} proposal={proposal} />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RfpDetails;
