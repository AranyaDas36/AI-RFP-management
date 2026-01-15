import Badge from '../common/Badge';

const RfpStatusTimeline = ({ status }) => {
  const statusSteps = [
    { key: 'draft', label: 'Draft', color: 'default' },
    { key: 'sent', label: 'Sent', color: 'info' },
    { key: 'responses_received', label: 'Responses Received', color: 'warning' },
    { key: 'evaluated', label: 'Evaluated', color: 'success' },
  ];

  const currentIndex = statusSteps.findIndex(step => step.key === status);

  return (
    <div className="flex items-center gap-4">
      {statusSteps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <Badge 
                variant={isActive ? step.color : 'default'}
                className={isCurrent ? 'ring-2 ring-offset-2 ring-primary-500' : ''}
              >
                {step.label}
              </Badge>
            </div>
            {index < statusSteps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${isActive ? 'bg-primary-500' : 'bg-gray-300'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RfpStatusTimeline;
