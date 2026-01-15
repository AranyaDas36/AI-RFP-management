import Card from '../common/Card';
import Badge from '../common/Badge';

const VendorList = ({ vendors, selectedVendors = [], onToggleSelection, showCheckboxes = false }) => {
  if (!vendors || vendors.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">No vendors found. Add vendors to get started.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {vendors.map((vendor) => {
        const isSelected = selectedVendors.includes(vendor._id);
        
        return (
          <Card
            key={vendor._id}
            className={`cursor-pointer transition-all ${
              showCheckboxes && isSelected
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => showCheckboxes && onToggleSelection?.(vendor._id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {showCheckboxes && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelection?.(vendor._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{vendor.name}</h4>
                    <p className="text-sm text-gray-600">{vendor.email}</p>
                    {vendor.company && (
                      <p className="text-sm text-gray-500 mt-1">{vendor.company}</p>
                    )}
                  </div>
                </div>
                {vendor.notes && (
                  <p className="text-sm text-gray-500 mt-2 ml-7">{vendor.notes}</p>
                )}
              </div>
              {vendor.company && !showCheckboxes && (
                <Badge variant="default">{vendor.company}</Badge>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default VendorList;
