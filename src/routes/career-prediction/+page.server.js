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
                behavioralRecord: profile.Behaviour || "No record",
                coCurricularActivity: profile.Cocuriculum || "No activity",
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
        let subjectsList = [];
        try {
            const subjectsObj = JSON.parse(subjectsJson);
            if (Array.isArray(subjectsObj) && subjectsObj.length > 0) {
                subjectsList = subjectsObj.map(s => ({
                    SubjectName: s.subjectName,
                    CalculatedScore: s.calculatedGrade,
                    Attendance: 0 // Placeholder as it was not directly available in form unless parsed differently
                }));
            }
        } catch (e) {
            console.error("Error parsing subjects:", e);
        }

        // Construct student data object for the shared helper
        const studentData = {
            // Mapping form data to the expected structure in ai.js
            Skills: skills,
            Interest: interest,
            subjects: subjectsList,
            assessments: [] // Assessments were embedded in string previously, but the helper handles them better if passed structured. 
            // However, to save time/complexity, I'll stick to the helper's expectation. 
            // The helper expects 'assessments' array. 
            // For now, I will pass an empty array or try to parse them if critical.
            // Actually the existing helper just formats them into text.
        };

        // Wait, the helper `generateAiPrediction` expects a specific structure:
        // { subjects: [...], assessments: [...], Skills: ..., Interest: ... }
        // The form data is a bit loose.
        // But `career-prediction` logic was formatting `academicContext` string manually.
        // `generateAiPrediction` DOES its own formatting.
        // So I need to pass the raw data associated with the user.
        // Actually, isn't it better to just fetch the data from DB again using the helper's preferred way?
        // OR construct the object correctly.

        // Let's rely on the DB fetch to be safe, similar to `api/predict`.
        // Fetching fresh data ensures consistency.

        try {
            // Re-fetch data for the official helper to ensure consistent context
            const [profileRows] = await mysqlConn.execute('SELECT * FROM StudentData WHERE StudID = ?', [userID]);
            const [subjectRows] = await mysqlConn.execute('SELECT * FROM Subject WHERE StudID = ?', [userID]);
            const [assessmentRows] = await mysqlConn.execute(`
                SELECT a.*, s.SubjectName 
                FROM Assessment a 
                JOIN Subject s ON a.SubjectID = s.SubjectID 
                WHERE s.StudID = ?
            `, [userID]);

            const freshStudentData = {
                Skills: profileRows[0]?.Skills || skills,
                Interest: profileRows[0]?.Interest || interest,
                Cocuriculum: profileRows[0]?.Cocuriculum || "",
                Behaviour: profileRows[0]?.Behaviour || "",
                subjects: subjectRows,
                assessments: assessmentRows
            };

            const result = await import('$lib/server/ai').then(m => m.generateAiPrediction(freshStudentData));

            // SAVE TO DB
            await mysqlConn.execute(`
                 INSERT INTO Prediction (PredictionText, StudID, RiskLevel)
                 VALUES (?, ?, ?)
             `, [result.predictionText, userID, result.riskLevel]);

            return { success: true, predictionResult: result.predictionText, riskLevel: result.riskLevel };

        } catch (e) {
            console.error("AI/DB Error:", e);
            return { success: false, predictionResult: "<p>Error generating prediction.</p>" };
        }
    }
};
