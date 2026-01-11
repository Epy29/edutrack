import { mysqlConn } from '$lib/db';
import { redirect, fail } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();

        const userID = data.get('userID');
        const password = data.get('password');
        const role = data.get('role');

        if (!userID || !password || !role) {
            return fail(400, { error: 'Missing login details' });
        }

        try {
            let query;
            let redirectPath;

            if (role === 'student') {
                query = 'SELECT StudID FROM student WHERE StudID = ? AND Password = ?';
                redirectPath = '/student-portal';
            } else if (role === 'lecturer') {
                query = 'SELECT LectID FROM lecturer WHERE LectID = ? AND Password = ?';
                redirectPath = '/lecturer';
            } else {
                return fail(400, { error: 'Invalid role' });
            }

            const [rows] = await mysqlConn.execute(query, [userID, password]);

            if (rows.length === 0) {
                return fail(401, { error: 'Invalid ID or Password' });
            }

            // SET SESSION COOKIES
            cookies.set('user_id', userID, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict'
            });

            cookies.set('role', role, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict'
            });

            throw redirect(303, redirectPath);

        } catch (err) {
            if (err.status === 303) throw err;
            console.error(err);
            return fail(500, { error: 'Database error. Please try again.' });
        }
    }
};
