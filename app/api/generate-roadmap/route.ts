import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticateUser } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateUser(request);
        if (authResult instanceof Response) {
            return authResult;
        }

        const { topic, goal, difficulty, currentLevel } = await request.json();

        if (!process.env.GEMINI_API_KEY) {
            return errorResponse(new Error('AI generation is not configured (Missing API Key)'), 503);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Create a detailed learning roadmap for: "${topic}".
        Difficulty Level: ${difficulty}
        ${goal ? `Goal: ${goal}` : ''}
        ${currentLevel ? `Current Knowledge: ${currentLevel}` : ''}

        Return a JSON object with the following structure:
        {
            "title": "A catchy title for the path",
            "description": "A brief overview",
            "category": "One specific category (Web Development, Data Science, etc.)",
            "difficulty": "${difficulty}",
            "steps": [
                {
                    "title": "Step title",
                    "description": "Detailed description of what to learn",
                    "estimatedDuration": "e.g., 1 week"
                }
            ]
        }
        Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json|```/g, '').trim();

        try {
            const roadmap = JSON.parse(responseText);
            return successResponse({ roadmap });
        } catch (e) {
            console.error('Failed to parse AI response:', responseText);
            return errorResponse(new Error('Failed to parse AI response'), 500);
        }

    } catch (error) {
        console.error('AI generation error:', error);
        return errorResponse(error);
    }
}
