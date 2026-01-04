import type { VercelRequest, VercelResponse } from '@vercel/node';

// Gemini AI for serverless function
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface TriageRequest {
    description: string;
    imageData?: string;
    focusArea?: string;
}

interface TriageResult {
    diagnosis: string;
    confidence: number;
    requiredSkillLevel: string;
    recommendedParts: string[];
    estimatedHours: number;
    complianceNotes: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { description, imageData, focusArea } = req.body as TriageRequest;

        // If no API key, return demo response
        if (!GEMINI_API_KEY) {
            return res.status(200).json({
                diagnosis: "Demo Mode - No API Key configured. In production, AI would analyze: " +
                    (description || "").substring(0, 50) + "...",
                confidence: 85,
                requiredSkillLevel: "Journeyman",
                recommendedParts: ["Capacitor", "Contactor", "Filter"],
                estimatedHours: 2,
                complianceNotes: "Demo: Always verify refrigerant levels per Local Law 97."
            } as TriageResult);
        }

        // Build prompt for Gemini
        let systemInstruction = `You are an expert HVAC Technician AI Triage system. Analyze the following issue description.
    Provide a structured diagnosis including likely cause, confidence level (0-100), required technician skill level (Apprentice, Journeyman, Master), recommended parts (generic names), estimated repair hours, and any notes related to NYC "Local Law 97" compliance if relevant.
    
    Respond ONLY with a valid JSON object in this exact format:
    {
      "diagnosis": "short technical diagnosis",
      "confidence": 85,
      "requiredSkillLevel": "Journeyman",
      "recommendedParts": ["Part1", "Part2"],
      "estimatedHours": 2,
      "complianceNotes": "compliance notes"
    }`;

        if (focusArea) {
            systemInstruction += `\n\nIMPORTANT: Focus your analysis specifically on potential '${focusArea}' issues.`;
        }

        const requestBody = {
            contents: [{
                parts: [
                    { text: systemInstruction },
                    { text: `User Description: ${description}` }
                ]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Gemini API Error:', error);
            throw new Error('Gemini API request failed');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]) as TriageResult;
            return res.status(200).json(result);
        }

        throw new Error('Invalid response format from Gemini');

    } catch (error) {
        console.error('Triage API Error:', error);
        return res.status(200).json({
            diagnosis: "Analysis Failed - Please try again",
            confidence: 0,
            requiredSkillLevel: "Master",
            recommendedParts: [],
            estimatedHours: 0,
            complianceNotes: "System error occurred."
        } as TriageResult);
    }
}
