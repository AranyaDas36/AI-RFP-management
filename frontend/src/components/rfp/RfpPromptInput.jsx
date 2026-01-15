import { useState } from 'react';
import Button from '../common/Button';
import Loader from '../common/Loader';

const RfpPromptInput = ({ onSubmit, isLoading = false }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="rfp-prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Describe what you want to procure...
        </label>
        <textarea
          id="rfp-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., I need 50 laptops with 16GB RAM, Intel i7 processors, and 512GB SSD. Budget is $50,000. Delivery needed within 2 weeks. Payment terms: Net 30. 2-year warranty required."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          rows={6}
          disabled={isLoading}
        />
        <p className="mt-2 text-sm text-gray-500">
          Describe your procurement needs in natural language. AI will structure it into a formal RFP.
        </p>
      </div>
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!prompt.trim() || isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader size="sm" />
              Processing...
            </span>
          ) : (
            'Create RFP'
          )}
        </Button>
      </div>
    </form>
  );
};

export default RfpPromptInput;
