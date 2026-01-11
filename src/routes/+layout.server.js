import { mysqlConn } from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies, url }) => {
    const userID = cookies.get('user_id');
    const role = cookies.get('role');

    // Not logged in
    if (!userID || !role) {
        if (url.pathname !== '/login') {
            throw redirect(303, '/login');
        }
        return {};
    }

    // Students cannot access lecturer pages
    if (url.pathname.startsWith('/lecturer') && role !== 'lecturer') {
        throw redirect(303, '/student-portal');
    }

    // Lecturers cannot access student pages
    if (url.pathname.startsWith('/student-portal') && role !== 'student') {
        throw redirect(303, '/lecturer');
    }

    // OPTIONAL: load user info for layout
    if (role === 'student') {
        const [rows] = await mysqlConn.execute(
            'SELECT StudID, Username FROM student WHERE StudID = ?',
            [userID]
        );

        return { student: rows[0] };
    }

    if (role === 'lecturer') {
        const [rows] = await mysqlConn.execute(
            'SELECT LectID, Username FROM lecturer WHERE LectID = ?',
            [userID]
        );

        return { lecturer: rows[0] };
    }

    return {};
};
