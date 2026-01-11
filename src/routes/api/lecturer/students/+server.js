import { json } from '@sveltejs/kit';
import { mysqlConn } from '$lib/db';

export async function GET({ cookies }) {
    const role = cookies.get('role');

    if (role !== 'lecturer') {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch Students and Latest Prediction
        const [studentRows] = await mysqlConn.execute(`
            SELECT s.StudID, s.Username, p.RiskLevel, p.PredictionText
            FROM Student s
            LEFT JOIN Prediction p ON s.StudID = p.StudID 
            AND p.PredID = (
                SELECT MAX(PredID) 
                FROM Prediction p2 
                WHERE p2.StudID = s.StudID
            )
        `);

        // Fetch Student Profile Data
        const [profileRows] = await mysqlConn.execute('SELECT StudID, Skills, Interest FROM StudentData');

        // Fetch Student Academic Data
        const [subjectRows] = await mysqlConn.execute('SELECT StudID, SubjectName, CalculatedScore, Attendance FROM Subject');

        // Helper to find profile for a student
        const getProfile = (id) => profileRows.find(p => p.StudID === id) || {};

        // Helper to find subjects for a student
        const getSubjects = (id) => subjectRows.filter(s => s.StudID === id).map(s => ({
            name: s.SubjectName,
            score: s.CalculatedScore,
            attendance: s.Attendance
        }));

        const students = studentRows.map(row => {
            const profile = getProfile(row.StudID);
            const subjects = getSubjects(row.StudID);

            return {
                id: row.StudID,
                name: row.Username,
                risk: row.RiskLevel || 'Not Assessed',
                prediction: row.PredictionText ? row.PredictionText.replace(/<[^>]*>?/gm, ' ').substring(0, 100) + '...' : 'No prediction available.',
                predictionFull: row.PredictionText || '',
                // New Fields
                skills: profile.Skills || 'None listed',
                interest: profile.Interest || 'None listed',
                subjects: subjects
            };
        });

        return json(students);

    } catch (err) {
        console.error('Student List API Error:', err);
        return json({ error: 'Failed to fetch student list' }, { status: 500 });
    }
}
