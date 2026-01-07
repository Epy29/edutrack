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
