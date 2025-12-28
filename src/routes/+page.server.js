export const actions = {
    predict: async ({ request }) => {
        const formData = await request.formData();
        
        // Retrieve data from form
        const name = formData.get('studentName');
        const subjects = formData.get('subjects'); 
        const skills = formData.get('skills');
        const interest = formData.get('interest');
        const attendance = formData.get('attendance');
        const behavior = formData.get('behavior');

        // --- AI LOGIC ---
        const apiKey = "AIzaSyDqEWjkafT4Egy77tsv-gFTUJ1S78a_NC0"; 
        
        const prompt = `
            Act as a Career Counselor. Analyze:
            Name: ${name}
            Academic: ${subjects}
            Attendance: ${attendance}%
            Behavior: ${behavior}
            Skills: ${skills}
            Interests: ${interest}

            Task: Predict exactly top 3 suitable career paths.
            Constraint: Keep descriptions very short (1 sentence).
            Format: Return ONLY raw HTML. Use this exact structure:
            <ul class="space-y-4">
                <li class="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div class="font-bold text-lg text-blue-800">1. [Career Name]</div>
                    <div class="text-sm text-blue-700 mt-1">[Short reasoning]</div>
                </li>
                <!-- Repeat for 2 and 3 -->
            </ul>
        `;

        let prediction = "<p>Prediction unavailable (Check API Key).</p>";

        if (apiKey) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const result = await response.json();
                if (result.candidates) {
                     prediction = result.candidates[0].content.parts[0].text;
                }
            } catch (e) {
                console.error("AI Error:", e);
            }
        }

        return { success: true, predictionResult: prediction };
    }
};