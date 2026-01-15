import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { rfpApi } from '../api/rfp.api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import RfpStatusTimeline from '../components/rfp/RfpStatusTimeline';

const Dashboard = () => {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      setLoading(true);
      const data = await rfpApi.getAllRFPs();
      setRfps(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      sent: 'info',
      responses_received: 'warning',
      evaluated: 'success',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadRFPs}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RFP Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your procurement requests</p>
        </div>
        <Link to="/create-rfp">
          <Button>Create New RFP</Button>
        </Link>
      </div>

      {rfps.length === 0 ? (
        <Card>
          <EmptyState
            title="No RFPs yet"
            description="Create your first RFP to get started with procurement management"
            action={
              <Link to="/create-rfp">
                <Button>Create RFP</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rfps.map((rfp) => (
            <Link key={rfp._id} to={`/rfp/${rfp._id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{rfp.title}</h3>
                      <RfpStatusTimeline status={rfp.status} />
                    </div>
                    <Badge variant={getStatusColor(rfp.status)}>
                      {rfp.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Items</p>
                      <p className="text-sm font-medium text-gray-900">
                        {rfp.structuredData?.items?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Vendors Sent</p>
                      <p className="text-sm font-medium text-gray-900">
                        {rfp.vendorsSentTo?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Budget</p>
                      <p className="text-sm font-medium text-gray-900">
                        {rfp.structuredData?.budget || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Created</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(rfp.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
