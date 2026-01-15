const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('❌ GEMINI_API_KEY missing');
}

const client = new GoogleGenAI({});

const DEFAULT_MODEL = 'gemini-3-flash-preview';

/**
 * Generate content using Gemini Interactions API
 * @param {string} prompt - The text prompt to send to Gemini
 * @returns {Promise<string>} - The generated text response
 */
async function generateWithGemini(prompt) {
  try {
    const interaction = await client.interactions.create({
      model: DEFAULT_MODEL,
      input: prompt,
    });

    // Get the last text output from the interaction
    const textOutput = interaction.outputs[interaction.outputs.length - 1];
    
    if (!textOutput || textOutput.type !== 'text') {
      throw new Error('No text output in Gemini response');
    }

    return textOutput.text;
  } catch (error) {
    // If the model is not available, try fallback models
    if (error.message && error.message.includes('not found')) {
      const fallbackModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
      
      for (const model of fallbackModels) {
        try {
          const interaction = await client.interactions.create({
            model: model,
            input: prompt,
          });

          const textOutput = interaction.outputs[interaction.outputs.length - 1];
          
          if (textOutput && textOutput.type === 'text') {
            console.log(`✅ Using fallback model: ${model} (${DEFAULT_MODEL} was not available)`);
            return textOutput.text;
          }
        } catch (fallbackError) {
          continue;
        }
      }
    }
    
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

console.log(`✅ Gemini client initialized - Model: ${DEFAULT_MODEL}`);

module.exports = { generateWithGemini, client };
