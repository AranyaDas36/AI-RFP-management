import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorApi } from '../api/vendor.api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import VendorForm from '../components/vendor/VendorForm';
import VendorList from '../components/vendor/VendorList';
import EmptyState from '../components/common/EmptyState';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorApi.getAllVendors();
      setVendors(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (vendorData) => {
    try {
      setSubmitting(true);
      setError(null);
      await vendorApi.createVendor(vendorData);
      await loadVendors();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-1">Add and manage your vendor contacts</p>
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      <VendorForm onSubmit={handleSubmit} isLoading={submitting} />

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Vendors ({vendors.length})
        </h3>
        {vendors.length === 0 ? (
          <EmptyState
            title="No vendors yet"
            description="Add your first vendor to start sending RFPs"
          />
        ) : (
          <VendorList vendors={vendors} />
        )}
      </Card>
    </div>
  );
};

export default Vendors;
