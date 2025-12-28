import { env } from '$env/dynamic/private';

/**
 * Generates a prediction for a student based on their data.
 * @param {Object} studentData - The student's profile and academic data.
 * @returns {Promise<{riskLevel: string, predictionText: string}>}
 */
export async function generateAiPrediction(studentData) {
    if (!env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not set. Returning mock prediction.");
        return {
            riskLevel: 'Medium',
            predictionText: "AI API Key missing. This is a mock prediction based on the available data. Please configure GEMINI_API_KEY in your .env file."
        };
    }

    const prompt = `
        Analyze the following student data and provide a performance prediction and risk assessment.
        
        Student Profile:
        Skills: ${studentData.Skills || 'None provided'}
        Interests: ${studentData.Interest || 'None provided'}
        
        Academic Performance:
        ${studentData.subjects.map(s => `- ${s.SubjectName}: ${s.CalculatedScore} (Attendance: ${s.Attendance}%)`).join('\n')}
        
        Assessment Scores:
        ${studentData.assessments.map(a => `- ${a.Name} (Subject ${a.SubjectName}): ${a.ScoreObtained}/${a.MaxScore}`).join('\n')}

        Based on this, predict their future performance trends and potential career paths.
        Also assign a Risk Level for failing or dropping out: 'Low', 'Medium', or 'High'.
        
            Format: Return STRICTLY JSON in this format:
            {
                "riskLevel": "Low|Medium|High",
                "predictionHtml": "<ul class='space-y-2'>...list items...</ul>"
            }
            
            Constraint for HTML: 
            - Use a COMPACT design.
            - Use this exact structure for items:
            <li class="p-3 bg-blue-50 rounded-md border border-blue-100">
                <div class="font-bold text-slate-800 text-sm">1. [Career Name]</div>
                <div class="text-xs text-slate-600 mt-1 leading-snug">[Short reasoning]</div>
            </li>
            - Keep descriptions very short (1 sentence).
        `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`AI API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // Clean up markdown code blocks if present to parse JSON
        const jsonString = textResponse.replace(/^```json\n|\n```$/g, '').trim();
        const result = JSON.parse(jsonString);

        return {
            riskLevel: result.riskLevel,
            predictionText: result.predictionHtml // Return HTML as the text content
        };

    } catch (error) {
        console.error("AI Generation Failed:", error);
        return {
            riskLevel: 'High',
            predictionText: "Failed to generate prediction due to technical error."
        };
    }
}
