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

        // 4. Fetch Latest Prediction (For the AI Result Box)
        // assume a 'Prediction' table exists. If not, return null.
        // const [predRows] = await mysqlConn.execute('SELECT * FROM Prediction WHERE StudID = ? ORDER BY date DESC LIMIT 1', [userID]);
        const latestPrediction = null; // Placeholder until create the Prediction table

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