import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { geminiModel, generateRoadmapPrompt, ROADMAP_GENERATION_PROMPT } from '@/lib/ai/prompts';
import { generateRoadmapSchema } from '@/lib/utils/validation';
import { successResponse, errorResponse, ApiError } from '@/lib/utils/apiResponse';
import { authenticateUser } from '@/lib/middleware/auth';
import { GenerateRoadmapRequest } from '@/lib/types';

/**
 * POST /api/generate - Generate learning roadmap using AI
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) return authResult;

        const body: GenerateRoadmapRequest = await request.json();

        // Validate request
        const validatedData = generateRoadmapSchema.parse(body);

        // Check if API key is configured
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
            throw new ApiError(
                503,
                'AI generation is not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY environment variable.'
            );
        }

        // Generate roadmap prompt
        const userPrompt = generateRoadmapPrompt({
            topic: validatedData.topic,
            goal: validatedData.goal,
            difficulty: validatedData.difficulty,
            currentLevel: validatedData.currentLevel,
        });

        // Call Gemini API
        const { text } = await generateText({
            model: geminiModel,
            system: ROADMAP_GENERATION_PROMPT,
            prompt: userPrompt,
            temperature: 0.7,
            maxTokens: 2000,
        });

        // Parse the response
        let roadmapData;
        try {
            // Extract JSON from response (in case there's extra text)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in AI response');
            }
            roadmapData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('Failed to parse AI response:', text);
            throw new ApiError(500, 'Failed to parse AI-generated roadmap');
        }

        // Validate the generated roadmap structure
        if (!roadmapData.title || !roadmapData.steps || !Array.isArray(roadmapData.steps)) {
            throw new ApiError(500, 'Invalid roadmap structure from AI');
        }

        // Ensure steps have required fields
        roadmapData.steps = roadmapData.steps.map((step: any, index: number) => ({
            title: step.title || `Step ${index + 1}`,
            description: step.description || '',
            resources: step.resources || [],
            estimatedDuration: step.estimatedDuration || 'Variable',
            order: step.order !== undefined ? step.order : index,
        }));

        return successResponse(
            {
                roadmap: roadmapData,
            },
            'Roadmap generated successfully'
        );
    } catch (error) {
        return errorResponse(error);
    }
}
