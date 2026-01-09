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
    issueDetected: boolean;
    issueSeverity: 'Critical' | 'Warning' | 'Advisory' | 'None';
    visualFindings: string[];
}

// Comprehensive HVAC issue detection knowledge
const HVAC_DETECTION_KNOWLEDGE = `
HVAC ISSUE DETECTION GUIDE - Use this knowledge to identify problems in images:

REFRIGERANT ISSUES:
- Oil stains around fittings or compressor = refrigerant leak
- Ice/frost on refrigerant lines or evaporator coil = low refrigerant or airflow issue
- Bubbles in sight glass = low refrigerant charge
- Copper tubing discoloration = overheating

ELECTRICAL FAULTS:
- Burn marks, scorching, or black residue = electrical short or overload
- Melted/discolored wires or insulation = overheating wires
- Corrosion on terminals/contactors = moisture damage, poor connection
- Swollen or bulging capacitors = capacitor failure
- Arc marks on contactors = worn contacts

MECHANICAL WEAR:
- Bent, cracked, or missing fan blades = physical damage
- Frayed, cracked, or glazed belts = belt wear/replacement needed
- Visible rust or corrosion on housing = water damage
- Loose mounting, visible vibration damage = motor/compressor issues
- Worn bearings (discoloration around shaft) = bearing failure

AIR QUALITY/AIRFLOW ISSUES:
- Heavily clogged or dirty filters = restricted airflow, poor efficiency
- Visible mold or mildew growth = health hazard, humidity problem
- Debris, dirt buildup on coils = reduced heat transfer
- Collapsed or disconnected ductwork = airflow loss
- Dirty blower wheel = reduced air movement

WATER/DRAINAGE PROBLEMS:
- Water stains, mineral deposits = condensate leak
- Standing water in drain pan = clogged drain line
- Rust streaks from unit = ongoing water exposure
- Algae growth in drain pan = biological growth

COMPRESSOR PROBLEMS:
- Oil stains at base of compressor = internal leak
- Discoloration/burn marks on compressor body = overheating
- Visible physical damage or dents = mechanical failure risk
- Excessive vibration marks = mounting or internal issue

SAFETY HAZARDS (CRITICAL):
- Exposed wiring without insulation = shock/fire hazard
- Gas line damage or corrosion = gas leak risk
- Improper electrical connections = fire hazard
- Missing safety guards or covers = injury risk
- Signs of animal infestation = contamination/damage
`;

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
                complianceNotes: "Demo: Always verify refrigerant levels per Local Law 97.",
                issueDetected: true,
                issueSeverity: "Warning",
                visualFindings: ["Demo: Dirty condenser coils detected", "Demo: Minor corrosion on electrical terminals"]
            } as TriageResult);
        }

        // Build comprehensive prompt for Gemini with image analysis capability
        let systemInstruction = `You are an expert HVAC Technician AI Triage system with advanced visual diagnostics capabilities.

${HVAC_DETECTION_KNOWLEDGE}

ANALYSIS INSTRUCTIONS:
1. If an image is provided, carefully analyze it for ANY visual indicators of problems using the detection guide above.
2. Look for signs of wear, damage, leaks, corrosion, dirt buildup, or safety hazards.
3. Cross-reference visual findings with the description provided.
4. Determine if an issue is detected and its severity level.

SEVERITY LEVELS:
- "Critical": Safety hazards, major component failures, requires immediate attention
- "Warning": Significant issues affecting performance, repair needed soon
- "Advisory": Minor issues, maintenance recommended, monitor closely
- "None": Equipment appears to be in good condition

Respond ONLY with a valid JSON object in this exact format:
{
  "diagnosis": "concise technical diagnosis based on visual and description analysis",
  "confidence": 85,
  "requiredSkillLevel": "Journeyman",
  "recommendedParts": ["Part1", "Part2"],
  "estimatedHours": 2,
  "complianceNotes": "NYC Local Law 97 compliance notes if relevant",
  "issueDetected": true,
  "issueSeverity": "Warning",
  "visualFindings": ["Specific issue 1 seen in image", "Specific issue 2"]
}

If no image is provided, base your analysis solely on the description and set visualFindings to an empty array.
If image is provided but no clear issues are visible, still analyze and note what components you can identify.`;

        if (focusArea) {
            systemInstruction += `\n\nIMPORTANT: Focus your analysis specifically on potential '${focusArea}' issues.`;
        }

        // Build request with optional image support
        const parts: any[] = [{ text: systemInstruction }];

        // Add image if provided (base64 data)
        if (imageData) {
            // Extract base64 data from data URL if present
            const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
            if (base64Match) {
                const mimeType = `image/${base64Match[1]}`;
                const base64Data = base64Match[2];
                parts.push({
                    inline_data: {
                        mime_type: mimeType,
                        data: base64Data
                    }
                });
                parts.push({ text: "Analyze this HVAC equipment image for any issues, damage, or maintenance needs." });
            }
        }

        // Add description
        if (description) {
            parts.push({ text: `User Description: ${description}` });
        } else if (!imageData) {
            parts.push({ text: "No description or image provided. Please provide equipment details for analysis." });
        }

        const requestBody = {
            contents: [{
                parts: parts
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1500,
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
            // Ensure all required fields exist
            return res.status(200).json({
                diagnosis: result.diagnosis || "Analysis complete",
                confidence: result.confidence || 0,
                requiredSkillLevel: result.requiredSkillLevel || "Journeyman",
                recommendedParts: result.recommendedParts || [],
                estimatedHours: result.estimatedHours || 0,
                complianceNotes: result.complianceNotes || "",
                issueDetected: result.issueDetected ?? false,
                issueSeverity: result.issueSeverity || "None",
                visualFindings: result.visualFindings || []
            });
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
            complianceNotes: "System error occurred.",
            issueDetected: false,
            issueSeverity: "None",
            visualFindings: []
        } as TriageResult);
    }
}
