import { TriageResult, TechLevel } from "../types";

// Check if we're in production (Vercel) or development
const isProduction = typeof window !== 'undefined' &&
  !window.location.hostname.includes('localhost');

export const analyzeHVACIssue = async (
  description: string,
  imageData?: string,
  focusArea?: string
): Promise<TriageResult> => {
  try {
    // In production, use the serverless API
    if (isProduction) {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, imageData, focusArea })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      // Map the response to match TechLevel enum
      return {
        ...data,
        requiredSkillLevel: mapSkillLevel(data.requiredSkillLevel)
      };
    }

    // In development without API, return demo response
    return {
      diagnosis: "Demo Mode - " + description.substring(0, 60) + "...",
      confidence: 85,
      requiredSkillLevel: TechLevel.JOURNEYMAN,
      recommendedParts: ["Capacitor", "Contactor", "Filter", "Refrigerant"],
      estimatedHours: 2.5,
      complianceNotes: "Demo: Always verify refrigerant levels per Local Law 97. Log all R-410A handling."
    };

  } catch (error) {
    console.error("Triage Analysis Failed:", error);
    return {
      diagnosis: "Analysis Failed - Check connection",
      confidence: 0,
      requiredSkillLevel: TechLevel.MASTER,
      recommendedParts: [],
      estimatedHours: 0,
      complianceNotes: "System error."
    };
  }
};

// Helper to map string skill level to enum
function mapSkillLevel(level: string): TechLevel {
  switch (level?.toLowerCase()) {
    case 'apprentice': return TechLevel.APPRENTICE;
    case 'master': return TechLevel.MASTER;
    default: return TechLevel.JOURNEYMAN;
  }
}