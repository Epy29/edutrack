import { mysqlConn } from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const studID = data.get('studID');
        const password = data.get('password');

        // 1. Check Database
        try {
            const [rows] = await mysqlConn.execute(
                'SELECT * FROM student WHERE StudID = ? AND Password = ?',
                [studID, password]
            );

            if (rows.length > 0) {
                // 2. Success: Create a "Session" cookie
                // store the StudID in the browser so we know who they are later
                cookies.set('user_id', studID, { path: '/' });
                
                // 3. Redirect to Dashboard
                throw redirect(303, '/student-portal');
            } else {
                return { error: 'Invalid Student ID or Password' };
            }
        } catch (error) {
            if (error.status === 303) throw error; // Allow redirect
            console.error(error);
            return { error: 'Database error. Please try again.' };
        }
    }
};