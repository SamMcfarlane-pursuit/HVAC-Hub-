import { GoogleGenAI, Type } from "@google/genai";
import { TriageResult, TechLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHVACIssue = async (
  description: string,
  imageData?: string,
  focusArea?: string
): Promise<TriageResult> => {
  try {
    const model = "gemini-2.5-flash";
    
    let systemInstruction = `You are an expert HVAC Technician AI Triage system. Analyze the following issue description and/or image. 
    Provide a structured diagnosis including likely cause, confidence level (0-100), required technician skill level (Apprentice, Journeyman, Master), recommended parts (generic names), estimated repair hours, and any notes related to NYC "Local Law 97" compliance if relevant (energy efficiency/refrigerant logging).`;

    if (focusArea) {
        systemInstruction += `\n\nIMPORTANT: Focus your analysis specifically on potential '${focusArea}' issues. Prioritize hypotheses related to this area over others.`;
    }
    
    // Construct parts
    const parts: any[] = [{ text: systemInstruction }];

    if (imageData) {
        // imageData is expected to be a base64 string without the prefix for the API, 
        // but often from inputs it comes with "data:image/png;base64,". We strip it if present.
        const cleanBase64 = imageData.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
            inlineData: {
                data: cleanBase64,
                mimeType: "image/jpeg"
            }
        });
    }

    parts.push({ text: `User Description: ${description}` });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING, description: "Short technical diagnosis" },
            confidence: { type: Type.NUMBER, description: "Confidence score 0-100" },
            requiredSkillLevel: { 
                type: Type.STRING, 
                enum: [TechLevel.APPRENTICE, TechLevel.JOURNEYMAN, TechLevel.MASTER] 
            },
            recommendedParts: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
            },
            estimatedHours: { type: Type.NUMBER },
            complianceNotes: { type: Type.STRING, description: "Notes on Local Law 97 or refrigerant tracking" }
          },
          required: ["diagnosis", "confidence", "requiredSkillLevel", "recommendedParts", "estimatedHours", "complianceNotes"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as TriageResult;
    }
    throw new Error("No response text generated");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback for demo purposes if API fails or key is missing
    return {
      diagnosis: "Analysis Failed (Check API Key)",
      confidence: 0,
      requiredSkillLevel: TechLevel.MASTER,
      recommendedParts: [],
      estimatedHours: 0,
      complianceNotes: "System error."
    };
  }
};