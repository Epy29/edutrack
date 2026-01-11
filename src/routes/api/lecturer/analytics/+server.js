import { json } from '@sveltejs/kit';
import { mysqlConn } from '$lib/db';

export async function GET({ cookies }) {
    const role = cookies.get('role');

    // Security check: Ensure only lecturers can access this data
    if (role !== 'lecturer') {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch Risk Distribution
        const [rows] = await mysqlConn.execute(`
            SELECT 
                SUM(CASE WHEN RiskLevel = 'Low' THEN 1 ELSE 0 END) as low,
                SUM(CASE WHEN RiskLevel = 'Medium' THEN 1 ELSE 0 END) as medium,
                SUM(CASE WHEN RiskLevel = 'High' THEN 1 ELSE 0 END) as high
            FROM Prediction
            WHERE PredID IN (
                SELECT MAX(PredID) FROM Prediction GROUP BY StudID
            )
        `);

        // Fetch Subject Performance
        const [subjectRows] = await mysqlConn.execute(`
            SELECT SubjectName, AVG(CalculatedScore) as AvgScore
            FROM Subject
            GROUP BY SubjectName
            ORDER BY AvgScore DESC
            LIMIT 5
        `);

        return json({
            low: parseInt(rows[0].low || 0),
            medium: parseInt(rows[0].medium || 0),
            high: parseInt(rows[0].high || 0),
            subjects: subjectRows.map(r => r.SubjectName),
            scores: subjectRows.map(r => parseFloat(r.AvgScore || 0).toFixed(1))
        });

    } catch (err) {
        console.error('Analytics API Error:', err);
        return json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }
}
