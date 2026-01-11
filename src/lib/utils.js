/* TEST 1 filter by subject*/
/**
 * Filters a list of students by a subject name.
 * @param {Array} students - The list of student objects.
 * @param {string} subjectFilter - The subject name to filter by.
 * @returns {Array} - The filtered list of students.
 */
export function filterStudentsBySubject(students, subjectFilter) {
    if (!subjectFilter) return students;
    return students.filter(s =>
        s.subjects?.some(sub => sub.name === subjectFilter)
    );
}

/* TEST 2: filter by risk level */
/**
 * Filters a list of students by risk level.
 * @param {Array} students - The list of student objects.
 * @param {string} riskFilter - The risk level to filter by.
 * @returns {Array} - The filtered list of students.
 */
export function filterStudentsByRisk(students, riskFilter) {
    if (!riskFilter) return students;
    return students.filter(s =>
        s.risk.toLowerCase() === riskFilter.toLowerCase()
    );
}


/* TEST 3: calculate final score */
/**
 * Calculates the final percentage score from assessments.
 * @param {Array} assessments - List of assessments with ScoreObtained and MaxScore.
 * @returns {number} - The final percentage score (0-100).
 */
export function calculateFinalScore(assessments) {
    let totalObtained = 0;
    let totalMaxAttempted = 0;

    for (const asm of assessments) {
        if (asm.ScoreObtained !== null) {
            totalObtained += parseFloat(asm.ScoreObtained);
            totalMaxAttempted += parseFloat(asm.MaxScore);
        }
    }

    if (totalMaxAttempted > 0) {
        return (totalObtained / totalMaxAttempted) * 100;
    }
    return 0;
}


