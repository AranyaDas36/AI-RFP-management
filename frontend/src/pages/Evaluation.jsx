import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { rfpApi } from '../api/rfp.api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ProposalComparisonTable from '../components/proposal/ProposalComparisonTable';

const Evaluation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rfpData, proposalsData] = await Promise.all([
        rfpApi.getRFPById(id),
        rfpApi.getRFPProposals(id).catch(() => []),
      ]);
      setRfp(rfpData);
      setProposals(proposalsData);
      
      // If RFP is already evaluated, load evaluation data
      if (rfpData.status === 'evaluated') {
        try {
          const evalData = await rfpApi.evaluateRFP(id);
          setEvaluation(evalData.evaluation);
          setProposals(evalData.proposals || proposalsData);
        } catch (err) {
          console.error('Error loading evaluation:', err);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (proposals.length === 0) {
      alert('No proposals to evaluate');
      return;
    }

    try {
      setEvaluating(true);
      setError(null);
      const result = await rfpApi.evaluateRFP(id);
      setEvaluation(result.evaluation);
      setProposals(result.proposals);
      setRfp(result.rfp);
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
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
          <Link to={`/rfp/${id}`} className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to RFP Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Proposal Evaluation</h1>
          <p className="text-gray-600 mt-1">{rfp?.title}</p>
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {proposals.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No proposals to evaluate yet.</p>
            <Link to={`/rfp/${id}`}>
              <Button>Back to RFP Details</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {!evaluation && (
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">
                    Ready to Evaluate
                  </h3>
                  <p className="text-sm text-blue-700">
                    You have {proposals.length} proposal(s). Click below to get AI-powered evaluation and ranking.
                  </p>
                </div>
                <Button onClick={handleEvaluate} disabled={evaluating}>
                  {evaluating ? 'Evaluating...' : 'Evaluate Proposals'}
                </Button>
              </div>
            </Card>
          )}

          {evaluation && (
            <ProposalComparisonTable proposals={proposals} evaluation={evaluation} />
          )}

          {!evaluation && (
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Proposals Received</h3>
                <p className="text-sm text-gray-600">
                  Click "Evaluate Proposals" above to get AI-powered comparison and recommendations.
                </p>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal._id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">
                        {proposal.vendor?.name || proposal.vendor?.email}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Received: {new Date(proposal.receivedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Evaluation;
