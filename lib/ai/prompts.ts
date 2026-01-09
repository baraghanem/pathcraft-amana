import { createGoogleGenerativeAI } from '@ai-sdk/google';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('AI API key is not set. AI generation will not work.');
}

export const google = createGoogleGenerativeAI({
  apiKey: apiKey || '',
});

// Use Gemini Pro for roadmap generation
export const geminiModel = google('gemini-2.0-flash-exp');

/**
 * System prompt for generating learning roadmaps
 */
export const ROADMAP_GENERATION_PROMPT = `You are an expert learning path designer and educator. Your role is to create comprehensive, structured learning roadmaps for any given topic.

When creating a learning roadmap, you should:
1. Break down complex topics into manageable steps
2. Order steps logically from beginner to advanced
3. Provide clear, actionable descriptions for each step
4. Include estimated time for each step when possible
5. Suggest relevant resources or topics to study
6. Ensure the roadmap is practical and achievable

The roadmap should be tailored to the user's specified difficulty level and goals.`;

/**
 * Generate a structured prompt for roadmap creation
 */
export function generateRoadmapPrompt(params: {
  topic: string;
  goal?: string;
  difficulty?: string;
  currentLevel?: string;
}): string {
  const { topic, goal, difficulty, currentLevel } = params;

  let prompt = `Create a comprehensive learning roadmap for: "${topic}"\n\n`;

  if (difficulty) {
    prompt += `Difficulty Level: ${difficulty}\n`;
  }

  if (currentLevel) {
    prompt += `Current Knowledge Level: ${currentLevel}\n`;
  }

  if (goal) {
    prompt += `Learning Goal: ${goal}\n`;
  }

  prompt += `\nPlease provide a structured learning path with:
- A clear, descriptive title
- A comprehensive description (2-3 sentences) of what the learner will achieve
- An appropriate category
- 5-12 steps, each with:
  * A clear title
  * A detailed description (2-3 sentences) explaining what to learn
  * Estimated duration (e.g., "2-3 hours", "1 week")
  * Order number starting from 0

Format your response as valid JSON following this exact structure:
{
  "title": "Learning path title",
  "description": "What the learner will achieve",
  "category": "Category name (e.g., Web Development, Data Science)",
  "difficulty": "${difficulty || 'Intermediate'}",
  "steps": [
    {
      "title": "Step title",
      "description": "What to learn in this step",
      "estimatedDuration": "Time needed",
      "order": 0
    }
  ]
}`;

  return prompt;
}
