import { mysqlConn } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load = async ({ cookies }) => {
    const userID = cookies.get('user_id');
    if (!userID) {
        throw redirect(303, '/login');
    }

    try {
        // 1. Fetch Student Identity
        const [studentRows] = await mysqlConn.execute('SELECT * FROM student WHERE StudID = ?', [userID]);
        const student = studentRows[0];
        if (!student) throw redirect(303, '/login');

        // 2. Fetch Profile Data
        const [profileRows] = await mysqlConn.execute('SELECT * FROM StudentData WHERE StudID = ?', [userID]);
        const profile = profileRows[0] || { Skills: '', Interest: '' };

        // 3. Fetch Subjects
        const [subjectRows] = await mysqlConn.execute('SELECT * FROM Subject WHERE StudID = ?', [userID]);

        // 4. Fetch Assessments
        // Fetching all assessments for this student's subjects
        const [assessmentRows] = await mysqlConn.execute(`
            SELECT a.*, s.SubjectID 
            FROM Assessment a 
            JOIN Subject s ON a.SubjectID = s.SubjectID 
            WHERE s.StudID = ?
        `, [userID]);

        // 5. Process Subjects & Assessments
        let totalAttendance = 0;
        let attendanceCount = 0;

        const subjectsProcessed = subjectRows.map(sub => {
            // Calculate Subject Attendance for Overall Average
            if (sub.Attendance !== null) {
                totalAttendance += parseFloat(sub.Attendance);
                attendanceCount++;
            }

            // Attach Assessments
            const subAssessments = assessmentRows.filter(a => a.SubjectID === sub.SubjectID).map(a => ({
                name: a.Name,
                scoreObtained: a.ScoreObtained,
                maxScore: a.MaxScore
            }));

            return {
                subjectName: sub.SubjectName,
                calculatedGrade: sub.CalculatedScore || 0, // Use DB score 
                assessments: subAssessments
            };
        });

        const overallAttendance = attendanceCount > 0 ? (totalAttendance / attendanceCount).toFixed(1) : 0;

        return {
            student: {
                studentName: student.Username,
                studentID: student.StudID,
                attendance: overallAttendance,
                behavioralRecord: "Excellent", // Placeholder as column doesn't exist
                coCurricularActivity: "Robotics Club", // Placeholder
                subjects: subjectsProcessed,
                skills: profile.Skills || "",
                interest: profile.Interest || ""
            }
        };

    } catch (error) {
        console.error("Dashboard Load Error:", error);
        return {
            student: {
                studentName: "Error Loading Data",
                subjects: [],
                attendance: 0
            }
        };
    }
};

export const actions = {
    predict: async ({ request, cookies }) => {
        const userID = cookies.get('user_id');
        if (!userID) {
            return { success: false, predictionResult: "<p>Please login to save predictions.</p>" };
        }

        const formData = await request.formData();

        // Retrieve data
        const name = formData.get('studentName');
        const subjectsJson = formData.get('subjects'); // This is a JSON string
        const skills = formData.get('skills');
        const interest = formData.get('interest');
        const attendance = formData.get('attendance');
        const behavior = formData.get('behavior');

        // Parse subjects to readable string for AI
        let academicContext = "No subject data.";
        try {
            const subjectsObj = JSON.parse(subjectsJson);
            if (Array.isArray(subjectsObj) && subjectsObj.length > 0) {
                academicContext = subjectsObj.map(s =>
                    `- ${s.subjectName}: ${s.calculatedGrade}% (Assessments: ${s.assessments.map(a => `${a.name}: ${a.scoreObtained}/${a.maxScore}`).join(', ')})`
                ).join('\n');
            }
        } catch (e) {
            console.error("Error parsing subjects:", e);
        }

        // --- AI LOGIC ---
        const apiKey = env.GEMINI_API_KEY;

        const prompt = `
            Act as a Career Counselor. Analyze this student:
            Name: ${name}
            Academic Performance:
            ${academicContext}
            
            Overall Attendance: ${attendance}%
            Behavioral Record: ${behavior}
            Skills: ${skills}
            Interests: ${interest}

            Task: 
            1. Predict top 3 suitable career paths based on their specific subject scores and interests.
            2. Assess the Risk Level of them failing or dropping out ('Low', 'Medium', or 'High').

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

        let predictionHtml = "<p>Prediction unavailable.</p>";

        let riskLevel = "Unknown";

        if (apiKey) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                const result = await response.json();
                const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (textResponse) {
                    // Extract JSON from potential markdown blocks
                    const jsonString = textResponse.replace(/^```json\n|\n```$/g, '').trim();
                    const aiData = JSON.parse(jsonString);

                    predictionHtml = aiData.predictionHtml;
                    riskLevel = aiData.riskLevel;

                    // SAVE TO DB
                    // Note: 'PredictionText' column is TEXT type (approx 64KB), which should fit this HTML easily.
                    await mysqlConn.execute(`
                        INSERT INTO Prediction (PredictionText, StudID, RiskLevel)
                        VALUES (?, ?, ?)
                    `, [predictionHtml, userID, riskLevel]);
                }

            } catch (e) {
                console.error("AI/DB Error:", e);
                predictionHtml = "<p>Error generating or saving prediction.</p>";
            }
        } else {
            predictionHtml = "<p>AI API Key missing.</p>";
        }

        return { success: true, predictionResult: predictionHtml, riskLevel };
        // wait, I can just use the 'riskLevel' variable I extracted earlier if it exists.
        // Let's rewrite the logic slightly to be cleaner.
    }
};
