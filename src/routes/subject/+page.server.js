import { mysqlConn } from '$lib/db';
import { redirect } from '@sveltejs/kit';

// 1. Helper Function: Recalculate Subject Score
async function updateSubjectScore(subjectID) {
    try {
        const [assessments] = await mysqlConn.execute(
            'SELECT MaxScore, ScoreObtained FROM Assessment WHERE SubjectID = ?',
            [subjectID]
        );

        let totalObtained = 0;
        let totalMaxAttempted = 0;

        for (const asm of assessments) {
            if (asm.ScoreObtained !== null) {
                totalObtained += parseFloat(asm.ScoreObtained);
                totalMaxAttempted += parseFloat(asm.MaxScore);
            }
        }

        let finalPercentage = 0;
        if (totalMaxAttempted > 0) {
            finalPercentage = (totalObtained / totalMaxAttempted) * 100;
        }

        await mysqlConn.execute(
            'UPDATE Subject SET CalculatedScore = ? WHERE subjectID = ?',
            [finalPercentage, subjectID]
        );

    } catch (e) {
        console.error("Score Calc Error:", e);
    }
}

export const load = async ({ cookies }) => {
    const userID = cookies.get('user_id');
    if (!userID) throw redirect(303, '/login');

    try {
        const [subjects] = await mysqlConn.execute('SELECT * FROM Subject WHERE StudID = ?', [userID]);

        const subjectIDs = subjects.map(s => s.subjectID);
        let assessments = [];

        if (subjectIDs.length > 0) {
            const placeholders = subjectIDs.map(() => '?').join(',');
            const [rows] = await mysqlConn.execute(
                `SELECT * FROM Assessment WHERE SubjectID IN (${placeholders}) ORDER BY AssessmentID ASC`,
                subjectIDs
            );
            assessments = rows;
        }

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
    // 2. Add Subject Action
    addSubject: async ({ request, cookies }) => {
        const userID = cookies.get('user_id');
        const data = await request.formData();
        const subjectName = data.get('subjectName');
        const attendance = data.get('attendance') || null;

        try {
            await mysqlConn.execute(
                'INSERT INTO Subject (StudID, SubjectName, Attendance) VALUES (?, ?, ?)',
                [userID, subjectName, attendance]
            );
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // 3. Update Subject Action
    updateSubject: async ({ request, cookies }) => {
        const userID = cookies.get('user_id');
        const data = await request.formData();
        const subjectID = data.get('subjectID');
        const newName = data.get('subjectName');
        const attendance = data.get('attendance') || null;

        try {
            await mysqlConn.execute(
                'UPDATE Subject SET SubjectName = ?, Attendance = ? WHERE subjectID = ? AND StudID = ?',
                [newName, attendance, subjectID, userID]
            );
            return { success: true };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return { success: false, error: "Subject name already exists." };
            }
            return { success: false };
        }
    },

    // 4. Delete Subject Action
    deleteSubject: async ({ request, cookies }) => {
        const userID = cookies.get('user_id');
        const data = await request.formData();
        const subjectID = data.get('subjectID');

        try {
            await mysqlConn.execute(
                'DELETE FROM Subject WHERE subjectID = ? AND StudID = ?',
                [subjectID, userID]
            );
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // 5. Add Assessment Action
    addAssessment: async ({ request }) => {
        const data = await request.formData();
        const subjectID = data.get('subjectID');
        const name = data.get('name');
        const maxScore = parseFloat(data.get('maxScore'));
        const scoreObtained = data.get('scoreObtained');

        const finalScore = scoreObtained === '' ? null : scoreObtained;

        try {
            // Check current total MaxScore for this subject
            const [rows] = await mysqlConn.execute(
                'SELECT SUM(MaxScore) as totalMax FROM Assessment WHERE SubjectID = ?',
                [subjectID]
            );

            const currentTotal = parseFloat(rows[0].totalMax || 0);

            // Validate if adding this assessment exceeds 100%
            if (currentTotal + maxScore > 100) {
                return {
                    success: false,
                    error: `Cannot add assessment. Total weightage would exceed 100%. Current total: ${currentTotal}%`
                };
            }

            await mysqlConn.execute(
                'INSERT INTO Assessment (SubjectID, AssessmentName, MaxScore, ScoreObtained) VALUES (?, ?, ?, ?)',
                [subjectID, name, maxScore, finalScore]
            );

            await updateSubjectScore(subjectID);

            return { success: true };
        } catch (error) {
            return { success: false, error: "Database error" };
        }
    },

    // 6. Update Assessment Action
    updateAssessment: async ({ request }) => {
        const data = await request.formData();
        const assessmentID = data.get('assessmentID');
        const name = data.get('name');
        const maxScore = parseFloat(data.get('maxScore'));
        const scoreObtained = data.get('scoreObtained');

        const [rows] = await mysqlConn.execute('SELECT SubjectID FROM Assessment WHERE AssessmentID = ?', [assessmentID]);
        const subjectID = rows[0]?.SubjectID;

        const finalScore = scoreObtained === '' ? null : scoreObtained;

        try {
            // Check total max score EXCLUDING this assessment (since we are updating it)
            const [totalRows] = await mysqlConn.execute(
                'SELECT SUM(MaxScore) as totalMax FROM Assessment WHERE SubjectID = ? AND AssessmentID != ?',
                [subjectID, assessmentID]
            );

            const otherAssessmentsTotal = parseFloat(totalRows[0].totalMax || 0);

            if (otherAssessmentsTotal + maxScore > 100) {
                return {
                    success: false,
                    error: `Update failed. Total weightage would exceed 100%. Current other assessments: ${otherAssessmentsTotal}%`
                };
            }

            await mysqlConn.execute(
                'UPDATE Assessment SET AssessmentName = ?, MaxScore = ?, ScoreObtained = ? WHERE AssessmentID = ?',
                [name, maxScore, finalScore, assessmentID]
            );

            if (subjectID) await updateSubjectScore(subjectID);

            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // 7. Delete Assessment Action
    deleteAssessment: async ({ request }) => {
        const data = await request.formData();
        const assessmentID = data.get('assessmentID');

        const [rows] = await mysqlConn.execute('SELECT SubjectID FROM Assessment WHERE AssessmentID = ?', [assessmentID]);
        const subjectID = rows[0]?.SubjectID;

        try {
            await mysqlConn.execute(
                'DELETE FROM Assessment WHERE AssessmentID = ?',
                [assessmentID]
            );

            if (subjectID) await updateSubjectScore(subjectID);

            return { success: true };
        } catch (error) {
            return { success: false };
        }
    }
};