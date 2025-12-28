import { json } from '@sveltejs/kit';
import { mysqlConn } from '$lib/db';
import { generateAiPrediction } from '$lib/server/ai';

export async function POST({ cookies }) {
    const userID = cookies.get('user_id');
    if (!userID) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Fetch all student context
        const [studentRows] = await mysqlConn.execute('SELECT * FROM Student WHERE StudID = ?', [userID]);
        const [profileRows] = await mysqlConn.execute('SELECT * FROM StudentData WHERE StudID = ?', [userID]);
        const [subjectRows] = await mysqlConn.execute('SELECT * FROM Subject WHERE StudID = ?', [userID]);
        const [assessmentRows] = await mysqlConn.execute(`
            SELECT a.*, s.SubjectName 
            FROM Assessment a 
            JOIN Subject s ON a.SubjectID = s.SubjectID 
            WHERE s.StudID = ?
        `, [userID]);

        if (studentRows.length === 0) {
            return json({ error: 'Student not found' }, { status: 404 });
        }

        const studentData = {
            ...studentRows[0],
            ...profileRows[0],
            subjects: subjectRows,
            assessments: assessmentRows
        };

        // 2. Generate Prediction
        const prediction = await generateAiPrediction(studentData);

        // 3. Save to Database
        await mysqlConn.execute(`
            INSERT INTO Prediction (PredictionText, StudID, RiskLevel)
            VALUES (?, ?, ?)
        `, [prediction.predictionText, userID, prediction.riskLevel]);

        return json({ success: true, prediction });

    } catch (error) {
        console.error('Prediction API Error:', error);
        return json({ error: 'Failed to generate prediction' }, { status: 500 });
    }
}
