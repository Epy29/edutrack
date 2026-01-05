import { mysqlConn } from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
    const userID = cookies.get('user_id');
    const role = cookies.get('role');

    if (!userID || role !== 'student') {
        throw redirect(303, '/login');
    }

    try {
        const [rows] = await mysqlConn.execute(`
            SELECT PredID, RiskLevel, PredictionText, CreatedAt 
            FROM Prediction 
            WHERE StudID = ? 
            ORDER BY CreatedAt DESC
        `, [userID]);

        return {
            predictions: rows
        };
    } catch (error) {
        console.error("History Load Error:", error);
        return {
            predictions: [],
            error: error.message // Return the error message to debug
        };
    }
};
