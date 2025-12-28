import { mysqlConn } from '$lib/db';
import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
    const userID = cookies.get('user_id');
    if (!userID) throw redirect(303, '/login');

    try {
        // 1. Fetch Subjects
        const [subjects] = await mysqlConn.execute('SELECT * FROM Subject WHERE StudID = ?', [userID]);

        // 2. Fetch Assessments for all these subjects
        // We fetch all assessments for this student's subjects in one go for efficiency
        const subjectIDs = subjects.map(s => s.subjectID);
        let assessments = [];
        
        if (subjectIDs.length > 0) {
            // Create a placeholder string like (?, ?, ?)
            const placeholders = subjectIDs.map(() => '?').join(',');
            const [rows] = await mysqlConn.execute(
                `SELECT * FROM Assessment WHERE SubjectID IN (${placeholders}) ORDER BY AssessmentID ASC`, 
                subjectIDs
            );
            assessments = rows;
        }

        // 3. Merge Assessments into their respective Subjects
        const subjectsWithAssessments = subjects.map(sub => {
            return {
                ...sub,
                assessments: assessments.filter(a => a.SubjectID === sub.subjectID)
            };
        });

        return { subjects: subjectsWithAssessments };

    } catch (error) {
        console.error("Subject Load Error:", error);
        return { subjects: [] };
    }
};

export const actions = {
    addSubject: async ({ request, cookies }) => {
        const userID = cookies.get('user_id');
        const data = await request.formData();
        const subjectName = data.get('subjectName');

        try {
            await mysqlConn.execute(
                'INSERT INTO Subject (StudID, SubjectName) VALUES (?, ?)',
                [userID, subjectName]
            );
            return { success: true };
        } catch (error) {
            console.error("Add Subject Error:", error);
            return { success: false };
        }
    },

    addAssessment: async ({ request }) => {
        const data = await request.formData();
        const subjectID = data.get('subjectID');
        const name = data.get('name');
        const maxScore = data.get('maxScore');
        const weightage = data.get('weightage'); // Assuming you add this column, or we map it to maxScore if 1-to-1

        try {
            await mysqlConn.execute(
                'INSERT INTO Assessment (SubjectID, AssessmentName, MaxScore) VALUES (?, ?, ?)',
                [subjectID, name, maxScore]
            );
            return { success: true };
        } catch (error) {
            console.error("Add Assessment Error:", error);
            return { success: false };
        }
    },

    // 1. UPDATE SUBJECT
    updateSubject: async ({ request, cookies }) => {
        const userID = cookies.get('user_id');
        const data = await request.formData();
        const subjectID = data.get('subjectID');
        const newName = data.get('subjectName');

        try {
            await mysqlConn.execute(
                'UPDATE Subject SET SubjectName = ? WHERE subjectID = ? AND StudID = ?',
                [newName, subjectID, userID]
            );
            return { success: true };
        } catch (error) {
            console.error("Update Subject Error:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                return { success: false, error: "Subject name already exists." };
            }
            return { success: false, error: "Failed to update subject." };
        }
    },

    // 2. DELETE SUBJECT
    deleteSubject: async ({ request, cookies }) => {
        const userID = cookies.get('user_id');
        const data = await request.formData();
        const subjectID = data.get('subjectID');

        try {
            // Assessments will be deleted automatically due to ON DELETE CASCADE
            await mysqlConn.execute(
                'DELETE FROM Subject WHERE subjectID = ? AND StudID = ?',
                [subjectID, userID]
            );
            return { success: true };
        } catch (error) {
            console.error("Delete Subject Error:", error);
            return { success: false, error: "Failed to delete subject." };
        }
    },

    // 3. UPDATE ASSESSMENT
    updateAssessment: async ({ request }) => {
        const data = await request.formData();
        const assessmentID = data.get('assessmentID');
        const name = data.get('name');
        const maxScore = data.get('maxScore');
        const scoreObtained = data.get('scoreObtained'); // specific field

        // Convert empty string to NULL for scoreObtained
        const finalScore = scoreObtained === '' ? null : scoreObtained;

        try {
            await mysqlConn.execute(
                'UPDATE Assessment SET AssessmentName = ?, MaxScore = ?, ScoreObtained = ? WHERE AssessmentID = ?',
                [name, maxScore, finalScore, assessmentID]
            );
            return { success: true };
        } catch (error) {
            console.error("Update Assessment Error:", error);
            return { success: false, error: "Failed to update assessment." };
        }
    },

    // 4. DELETE ASSESSMENT
    deleteAssessment: async ({ request }) => {
        const data = await request.formData();
        const assessmentID = data.get('assessmentID');

        try {
            await mysqlConn.execute(
                'DELETE FROM Assessment WHERE AssessmentID = ?',
                [assessmentID]
            );
            return { success: true };
        } catch (error) {
            console.error("Delete Assessment Error:", error);
            return { success: false, error: "Failed to delete assessment." };
        }
    }
};