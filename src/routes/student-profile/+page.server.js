import { mysqlConn } from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
    const userID = cookies.get('user_id');
    if (!userID) throw redirect(303, '/login');

    try {
        // 1. Fetch Student Identity (Name, ID, Email, Class)
        const [studentRows] = await mysqlConn.execute('SELECT * FROM student WHERE StudID = ?', [userID]);
        const student = studentRows[0];

        if (!student) {
             // If user ID in cookie doesn't exist in DB
             throw redirect(303, '/login');
        }

        // 2. Fetch Profile Data (Skills, Interests)
        const [profileRows] = await mysqlConn.execute('SELECT * FROM StudentData WHERE StudID = ?', [userID]);
        const profile = profileRows[0] || { Skills: '', Interest: '' }; // Default empty if no profile

        // 3. Calculate Overall Attendance
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
                // Spread student identity fields first
                ...student, 
                // Spread profile fields (Skills, Interest)
                ...profile,
                // Add calculated field
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

        try {
            // Update StudentData table
            await mysqlConn.execute(`
                INSERT INTO StudentData (StudID, Skills, Interest) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE Skills = VALUES(Skills), Interest = VALUES(Interest)
            `, [userID, skills, interest]);

            return { success: true };
        } catch (error) {
            console.error("Update Error:", error);
            return { success: false, error: "Failed to update profile." };
        }
    }
};