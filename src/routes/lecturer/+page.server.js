import { redirect } from '@sveltejs/kit';
import { filterStudentsBySubject, filterStudentsByRisk } from '$lib/utils';

export async function load({ cookies, fetch, url }) {
    const role = cookies.get('role');

    // Redirect if not lecturer
    if (role !== 'lecturer') {
        throw redirect(303, '/login');
    }

    // Get filter params from URL
    const subjectFilter = url.searchParams.get('subject') || '';
    const riskFilter = url.searchParams.get('risk') || '';

    try {
        // Fetch analytics and students data in parallel
        const [analyticsRes, studentsRes] = await Promise.all([
            fetch('/api/lecturer/analytics'),
            fetch('/api/lecturer/students')
        ]);

        const analytics = await analyticsRes.json();
        let students = await studentsRes.json();

        // Handle API errors
        if (students.error) {
            return {
                analytics: { low: 0, medium: 0, high: 0, subjects: [], scores: [] },
                students: [],
                allSubjects: [],
                filters: { subject: subjectFilter, risk: riskFilter },
                error: students.error
            };
        }

        // Extract unique subjects for filter dropdown
        const allSubjects = [...new Set(
            students.flatMap(s => s.subjects?.map(sub => sub.name) || [])
        )].sort();

        // Server-side filtering by subject
        students = filterStudentsBySubject(students, subjectFilter);

        // Server-side filtering by risk level
        students = filterStudentsByRisk(students, riskFilter);

        return {
            analytics,
            students,
            allSubjects,
            filters: { subject: subjectFilter, risk: riskFilter }
        };

    } catch (err) {
        console.error('Lecturer page load error:', err);
        return {
            analytics: { low: 0, medium: 0, high: 0, subjects: [], scores: [] },
            students: [],
            allSubjects: [],
            filters: { subject: subjectFilter, risk: riskFilter },
            error: 'Failed to load data'
        };
    }
}
