import Card from '../common/Card';
import Badge from '../common/Badge';

const RfpStructuredView = ({ rfp }) => {
  if (!rfp || !rfp.structuredData) return null;

  const { structuredData } = rfp;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Structured RFP Details</h3>
      </div>

      {structuredData.items && structuredData.items.length > 0 && (
        <Card>
          <h4 className="font-medium text-gray-900 mb-3">Items Required</h4>
          <div className="space-y-3">
            {structuredData.items.map((item, index) => (
              <div key={index} className="border-l-4 border-primary-500 pl-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.specs && (
                      <p className="text-sm text-gray-600 mt-1">{item.specs}</p>
                    )}
                  </div>
                  <Badge variant="info" className="ml-4">
                    Qty: {item.quantity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {structuredData.budget && (
          <Card>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Budget</h4>
            <p className="text-lg font-semibold text-gray-900">{structuredData.budget}</p>
          </Card>
        )}

        {structuredData.deliveryTimeline && (
          <Card>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Delivery Timeline</h4>
            <p className="text-lg font-semibold text-gray-900">{structuredData.deliveryTimeline}</p>
          </Card>
        )}

        {structuredData.paymentTerms && (
          <Card>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Terms</h4>
            <p className="text-lg font-semibold text-gray-900">{structuredData.paymentTerms}</p>
          </Card>
        )}

        {structuredData.warranty && (
          <Card>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Warranty</h4>
            <p className="text-lg font-semibold text-gray-900">{structuredData.warranty}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RfpStructuredView;
