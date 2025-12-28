import { mysqlConn } from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
    const userID = cookies.get('user_id');

    if (!userID) {
        throw redirect(303, '/login');
    }

    try {
        // 1. Fetch Student Info
        const [studentRows] = await mysqlConn.execute('SELECT * FROM student WHERE StudID = ?', [userID]);
        const student = studentRows[0];

        // 2. Fetch Profile (Skills/Interests) - for AI Prediction context
        const [profileRows] = await mysqlConn.execute('SELECT * FROM StudentData WHERE StudID = ?', [userID]);
        const profile = profileRows[0] || {};

        // 3. Fetch Subjects & Grades (For the Academic Table)
        const [subjectRows] = await mysqlConn.execute('SELECT * FROM Subject WHERE StudID = ?', [userID]);

        // 4. Fetch Latest Prediction
        const [predRows] = await mysqlConn.execute('SELECT * FROM Prediction WHERE StudID = ? ORDER BY PredID DESC LIMIT 1', [userID]);
        let latestPrediction = null;
        if (predRows.length > 0) {
            latestPrediction = {
                careerTitle: "AI Prediction", // The table doesn't have a title column yet, using a generic one or parsing if possible.
                description: predRows[0].PredictionText,
                riskLevel: predRows[0].RiskLevel
            };
        }

        return {
            student: {
                name: student.Username,
                id: student.StudID,
                subjects: subjectRows, // Array of subjects
                prediction: latestPrediction
            }
        };

    } catch (error) {
        console.error("Dashboard Load Error:", error);
        return { student: null };
    }
};