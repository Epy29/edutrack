import { mysqlConn } from '$lib/db';

export const load = async ({ cookies }) => {
    const userID = cookies.get('user_id');

    if (!userID) {
        return { student: null };
    }

    try {
        const [rows] = await mysqlConn.execute('SELECT StudID, Username FROM student WHERE StudID = ?', [userID]);

        if (rows.length > 0) {
            return {
                student: {
                    studentID: rows[0].StudID,
                    studentName: rows[0].Username
                }
            };
        }
    } catch (e) {
        console.error("Layout Load Error:", e);
    }

    return { student: null };
};
