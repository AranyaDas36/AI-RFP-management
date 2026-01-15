import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rfpApi } from '../api/rfp.api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import RfpPromptInput from '../components/rfp/RfpPromptInput';
import RfpStructuredView from '../components/rfp/RfpStructuredView';

const CreateRfp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rfp, setRfp] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (prompt) => {
    try {
      setLoading(true);
      setError(null);
      const createdRfp = await rfpApi.createRFP(prompt);
      setRfp(createdRfp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (rfp) {
      navigate(`/rfp/${rfp._id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New RFP</h1>
        <p className="text-gray-600 mt-1">Describe your procurement needs in natural language</p>
      </div>

      {!rfp ? (
        <Card>
          <RfpPromptInput onSubmit={handleSubmit} isLoading={loading} />
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">
                  RFP Created Successfully!
                </h3>
                <p className="text-sm text-green-700">
                  Your RFP has been structured and is ready to send to vendors.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <RfpStructuredView rfp={rfp} />
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleViewDetails} variant="primary">
              View RFP Details
            </Button>
            <Button
              onClick={() => {
                setRfp(null);
                setError(null);
              }}
              variant="secondary"
            >
              Create Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRfp;
