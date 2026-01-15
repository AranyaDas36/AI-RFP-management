const { generateWithGemini } = require('../config/gemini');

class AIService {
  /**
   * Structure a natural language RFP prompt into structured JSON
   */
  async structureRFP(rawPrompt) {
    try {
      if (!rawPrompt || typeof rawPrompt !== 'string') {
        throw new Error('Invalid prompt provided');
      }

      const prompt = `You are an expert procurement analyst. Parse the following natural language procurement request into a structured JSON format.

Input: ${rawPrompt}

Extract and structure the following information:
1. items: Array of objects with {name, quantity, specs}
2. budget: Budget range or amount mentioned
3. deliveryTimeline: Expected delivery timeline
4. paymentTerms: Payment terms mentioned
5. warranty: Warranty requirements

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no explanations):
{
  "items": [{"name": "string", "quantity": number, "specs": "string"}],
  "budget": "string",
  "deliveryTimeline": "string",
  "paymentTerms": "string",
  "warranty": "string"
}

If any field is not mentioned, use an empty string or empty array.`;

      const aiText = await generateWithGemini(prompt);

      if (!aiText) {
        throw new Error('Empty response from Gemini');
      }

      // Attempt strict JSON extraction
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error('Gemini raw output:', aiText);
        throw new Error('No JSON object found in AI response');
      }

      const structuredData = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (!structuredData.items || !Array.isArray(structuredData.items)) {
        structuredData.items = [];
      }

      return {
        items: structuredData.items || [],
        budget: structuredData.budget || '',
        deliveryTimeline: structuredData.deliveryTimeline || '',
        paymentTerms: structuredData.paymentTerms || '',
        warranty: structuredData.warranty || '',
      };
    } catch (err) {
      console.error('AIService.structureRFP error:', err.message);
      if (err.stack) {
        console.error('Stack:', err.stack);
      }
      throw new Error(`Failed to structure RFP: ${err.message}`);
    }
  }

  /**
   * Extract structured data from vendor email response
   */
  async parseVendorResponse(emailBody) {
    try {
      if (!emailBody || typeof emailBody !== 'string') {
        throw new Error('Invalid email body provided');
      }

      const prompt = `You are an expert at extracting proposal information from vendor emails. Parse the following vendor email response into structured data.

Email Body:
${emailBody}

Extract the following information:
1. totalPrice: Total price quoted (as string, preserve currency symbols)
2. itemBreakdown: Array of {itemName, quantity, unitPrice, totalPrice, notes}
3. deliveryTimeline: Delivery timeline mentioned
4. paymentTerms: Payment terms
5. warranty: Warranty information
6. exceptions: Any exceptions, conditions, or special notes

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "totalPrice": "string",
  "itemBreakdown": [{"itemName": "string", "quantity": number, "unitPrice": number, "totalPrice": number, "notes": "string"}],
  "deliveryTimeline": "string",
  "paymentTerms": "string",
  "warranty": "string",
  "exceptions": "string"
}

If any field is not mentioned, use an empty string or empty array.`;

      const aiText = await generateWithGemini(prompt);

      if (!aiText) {
        console.warn('Empty response from Gemini for vendor email parsing');
        throw new Error('Empty response from Gemini');
      }

      // Attempt strict JSON extraction
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error('Gemini raw output:', aiText);
        console.warn('Gemini did not return valid JSON for vendor response. Using empty structure.');
        throw new Error('No JSON object found in AI response');
      }

      const extractedData = JSON.parse(jsonMatch[0]);

      return {
        totalPrice: extractedData.totalPrice || '',
        itemBreakdown: Array.isArray(extractedData.itemBreakdown) ? extractedData.itemBreakdown : [],
        deliveryTimeline: extractedData.deliveryTimeline || '',
        paymentTerms: extractedData.paymentTerms || '',
        warranty: extractedData.warranty || '',
        exceptions: extractedData.exceptions || '',
      };
    } catch (err) {
      console.error('AIService.parseVendorResponse error:', err.message);
      if (err.stack) {
        console.error('Stack:', err.stack);
      }
      // Return empty structure on error (graceful degradation)
      return {
        totalPrice: '',
        itemBreakdown: [],
        deliveryTimeline: '',
        paymentTerms: '',
        warranty: '',
        exceptions: '',
      };
    }
  }

  /**
   * Evaluate and compare all proposals for an RFP
   */
  async evaluateProposals(rfp, proposals) {
    try {
      if (!rfp || !proposals || !Array.isArray(proposals) || proposals.length === 0) {
        throw new Error('Invalid RFP or proposals provided');
      }

      const rfpData = JSON.stringify(rfp.structuredData, null, 2);
      const proposalsData = proposals.map(p => ({
        vendor: (p.vendor && (p.vendor.name || p.vendor.email)) || 'Unknown Vendor',
        extractedData: p.extractedData,
        rawEmailBody: (p.rawEmailBody || '').substring(0, 1000), // Limit length
      }));

      const prompt = `You are an expert procurement evaluator. Evaluate and compare vendor proposals against the RFP requirements.

RFP Requirements:
${rfpData}

Vendor Proposals:
${JSON.stringify(proposalsData, null, 2)}

For each vendor proposal, provide:
1. A score from 0-100 based on:
   - Price competitiveness
   - Alignment with requirements
   - Delivery timeline feasibility
   - Payment terms acceptability
   - Warranty coverage
   - Overall professionalism

2. A brief summary of strengths and weaknesses

3. A clear recommendation ranking vendors from best to worst

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "comparison": [
    {
      "vendor": "vendor name/email",
      "score": number (0-100),
      "summary": "string",
      "strengths": ["string"],
      "weaknesses": ["string"]
    }
  ],
  "recommendation": {
    "topVendor": "vendor name/email",
    "reasoning": "string explaining why this vendor is recommended"
  }
}`;

      const aiText = await generateWithGemini(prompt);

      if (!aiText) {
        throw new Error('Empty response from Gemini');
      }

      // Attempt strict JSON extraction
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error('Gemini raw output:', aiText);
        throw new Error('No JSON object found in AI response');
      }

      const evaluation = JSON.parse(jsonMatch[0]);

      // Update proposal scores
      if (evaluation.comparison && Array.isArray(evaluation.comparison)) {
        for (const comp of evaluation.comparison) {
          const proposal = proposals.find(p => {
            const vendor = p.vendor;
            if (!vendor) return false;
            return vendor.name === comp.vendor || vendor.email === comp.vendor;
          });
          if (proposal) {
            proposal.aiScore = comp.score;
            proposal.aiSummary = comp.summary || '';
            await proposal.save();
          }
        }
      }

      return evaluation;
    } catch (err) {
      console.error('AIService.evaluateProposals error:', err.message);
      if (err.stack) {
        console.error('Stack:', err.stack);
      }
      throw new Error(`Failed to evaluate proposals: ${err.message}`);
    }
  }
}

module.exports = new AIService();
