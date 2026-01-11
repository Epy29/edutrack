import { mysqlConn } from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
    const userID = cookies.get('user_id');
    if (!userID) throw redirect(303, '/login');

    try {
        // Fetch student identity
        const [studentRows] = await mysqlConn.execute('SELECT * FROM student WHERE StudID = ?', [userID]);
        const student = studentRows[0];

        if (!student) {
            // If user ID in cookie doesn't exist in DB
            throw redirect(303, '/login');
        }

        // Fetch profile data
        const [profileRows] = await mysqlConn.execute('SELECT * FROM StudentData WHERE StudID = ?', [userID]);
        const profile = profileRows[0] || { Skills: '', Interest: '', Cocuriculum: '', Behaviour: '' }; // Default empty if no profile

        // Calculate overall attendance
        const [subjectRows] = await mysqlConn.execute('SELECT Attendance FROM Subject WHERE StudID = ?', [userID]);

        let totalAttendance = 0;
        let count = 0;
        subjectRows.forEach(sub => {
            if (sub.Attendance !== null) {
                totalAttendance += parseFloat(sub.Attendance);
                count++;
            }
        });
        const avgAttendance = count > 0 ? (totalAttendance / count).toFixed(1) : 0;

        return {
            student: {
                // Student identity
                ...student,
                // Profile fields
                ...profile,
                // Calculated fields
                attendanceAvg: avgAttendance
            }
        };

    } catch (error) {
        console.error("Profile Load Error:", error);
        return { student: null };
    }
};

export const actions = {
    update: async ({ request, cookies }) => {
        const userID = cookies.get('user_id');
        if (!userID) throw redirect(303, '/login');

        const data = await request.formData();
        const skills = data.get('skills');
        const interest = data.get('interest');
        const cocuriculum = data.get('cocuriculum');
        const behaviour = data.get('behaviour');

        try {
            // Update StudentData table
            await mysqlConn.execute(`
                INSERT INTO StudentData(StudID, Skills, Interest, Cocuriculum, Behaviour)
                VALUES(?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                    Skills = VALUES(Skills), 
                    Interest = VALUES(Interest),
                    Cocuriculum = VALUES(Cocuriculum),
                    Behaviour = VALUES(Behaviour)
            `, [userID, skills, interest, cocuriculum, behaviour]);

            return { success: true };
        } catch (error) {
            console.error("Update Error:", error);
            return { success: false, error: "Failed to update profile." };
        }
    }
};