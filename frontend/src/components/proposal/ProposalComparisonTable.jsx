import Card from '../common/Card';
import Badge from '../common/Badge';
import ScoreBar from './ScoreBar';

const ProposalComparisonTable = ({ proposals, evaluation }) => {
  if (!proposals || proposals.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">No proposals to compare.</p>
      </Card>
    );
  }

  // Sort proposals by score (highest first)
  const sortedProposals = [...proposals].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

  return (
    <div className="space-y-6">
      {evaluation && evaluation.recommendation && (
        <Card className="bg-primary-50 border-primary-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Badge variant="success" className="text-base px-3 py-1">
                Recommended
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Top Vendor: {evaluation.recommendation.topVendor}
              </h4>
              <p className="text-sm text-gray-700">{evaluation.recommendation.reasoning}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {sortedProposals.map((proposal, index) => {
          const vendor = proposal.vendor || {};
          const extracted = proposal.extractedData || {};
          const comparison = evaluation?.comparison?.find(
            (c) => c.vendor === vendor.name || c.vendor === vendor.email
          );

          return (
            <Card key={proposal._id} className={index === 0 ? 'ring-2 ring-primary-500' : ''}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {index + 1}. {vendor.name || vendor.email}
                      </h4>
                      {index === 0 && <Badge variant="success">Best Match</Badge>}
                    </div>
                    {vendor.company && (
                      <p className="text-sm text-gray-600">{vendor.company}</p>
                    )}
                  </div>
                  {proposal.aiScore !== null && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{proposal.aiScore}</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  )}
                </div>

                {proposal.aiScore !== null && (
                  <ScoreBar score={proposal.aiScore} />
                )}

                {comparison && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                    {comparison.strengths && comparison.strengths.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-700 mb-2">Strengths</p>
                        <ul className="space-y-1">
                          {comparison.strengths.map((strength, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {comparison.weaknesses && comparison.weaknesses.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-700 mb-2">Weaknesses</p>
                        <ul className="space-y-1">
                          {comparison.weaknesses.map((weakness, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-red-500 mt-1">✗</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
                  {extracted.totalPrice && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Price</p>
                      <p className="text-sm font-semibold text-gray-900">{extracted.totalPrice}</p>
                    </div>
                  )}
                  {extracted.deliveryTimeline && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Delivery</p>
                      <p className="text-sm font-semibold text-gray-900">{extracted.deliveryTimeline}</p>
                    </div>
                  )}
                  {extracted.paymentTerms && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Payment</p>
                      <p className="text-sm font-semibold text-gray-900">{extracted.paymentTerms}</p>
                    </div>
                  )}
                  {extracted.warranty && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Warranty</p>
                      <p className="text-sm font-semibold text-gray-900">{extracted.warranty}</p>
                    </div>
                  )}
                </div>

                {comparison?.summary && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 mb-1">AI Summary</p>
                    <p className="text-sm text-gray-700">{comparison.summary}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProposalComparisonTable;
