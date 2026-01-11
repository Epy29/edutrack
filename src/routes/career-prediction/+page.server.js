import { mysqlConn } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load = async ({ cookies }) => {
    const userID = cookies.get('user_id');
    if (!userID) {
        throw redirect(303, '/login');
    }

    try {
        // Fetch student identity
        const [studentRows] = await mysqlConn.execute('SELECT * FROM student WHERE StudID = ?', [userID]);
        const student = studentRows[0];
        if (!student) throw redirect(303, '/login');

        // Fetch profile data
        const [profileRows] = await mysqlConn.execute('SELECT * FROM StudentData WHERE StudID = ?', [userID]);
        const profile = profileRows[0] || { Skills: '', Interest: '' };

        // Fetch subjects
        const [subjectRows] = await mysqlConn.execute('SELECT * FROM Subject WHERE StudID = ?', [userID]);

        // Fetch assessments
        const [assessmentRows] = await mysqlConn.execute(`
            SELECT a.*, s.SubjectID 
            FROM Assessment a 
            JOIN Subject s ON a.SubjectID = s.SubjectID 
            WHERE s.StudID = ?
        `, [userID]);

        // Process subjects and assessments
        let totalAttendance = 0;
        let attendanceCount = 0;

        const subjectsProcessed = subjectRows.map(sub => {
            // Calculate subject attendance
            if (sub.Attendance !== null) {
                totalAttendance += parseFloat(sub.Attendance);
                attendanceCount++;
            }

            // Attach assessments
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



        // Re-fetch data from DB to ensure consistency with the helper function's expectations
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
