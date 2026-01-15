import Card from '../common/Card';
import Badge from '../common/Badge';
import ScoreBar from './ScoreBar';

const ProposalCard = ({ proposal, showScore = false }) => {
  if (!proposal) return null;

  const vendor = proposal.vendor || {};
  const extracted = proposal.extractedData || {};

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{vendor.name || vendor.email}</h4>
            <p className="text-sm text-gray-600">{vendor.email}</p>
            {vendor.company && (
              <p className="text-sm text-gray-500 mt-1">{vendor.company}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {proposal.aiScore !== null && showScore && (
              <Badge variant={proposal.aiScore >= 80 ? 'success' : proposal.aiScore >= 60 ? 'warning' : 'danger'}>
                Score: {proposal.aiScore}
              </Badge>
            )}
            <Badge variant="info">AI Parsed</Badge>
          </div>
        </div>

        {extracted.totalPrice && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-1">Total Price</p>
            <p className="text-xl font-bold text-gray-900">{extracted.totalPrice}</p>
          </div>
        )}

        {extracted.itemBreakdown && extracted.itemBreakdown.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Item Breakdown</p>
            <div className="space-y-2">
              {extracted.itemBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.itemName} (Qty: {item.quantity})
                  </span>
                  <span className="font-medium text-gray-900">
                    {item.totalPrice ? `$${item.totalPrice.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          {extracted.deliveryTimeline && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Delivery</p>
              <p className="text-sm font-medium text-gray-900">{extracted.deliveryTimeline}</p>
            </div>
          )}
          {extracted.paymentTerms && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Payment Terms</p>
              <p className="text-sm font-medium text-gray-900">{extracted.paymentTerms}</p>
            </div>
          )}
        </div>

        {extracted.warranty && (
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-1">Warranty</p>
            <p className="text-sm font-medium text-gray-900">{extracted.warranty}</p>
          </div>
        )}

        {extracted.exceptions && (
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-1">Exceptions / Notes</p>
            <p className="text-sm text-gray-700 italic">{extracted.exceptions}</p>
          </div>
        )}

        {proposal.aiSummary && (
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-1">AI Summary</p>
            <p className="text-sm text-gray-700">{proposal.aiSummary}</p>
          </div>
        )}

        {proposal.aiScore !== null && showScore && (
          <div className="border-t pt-4">
            <ScoreBar score={proposal.aiScore} />
          </div>
        )}

        <div className="border-t pt-4 text-xs text-gray-500">
          Received: {new Date(proposal.receivedAt).toLocaleString()}
        </div>
      </div>
    </Card>
  );
};

export default ProposalCard;
