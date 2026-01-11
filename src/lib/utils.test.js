import { describe, it, expect } from 'vitest';
import { filterStudentsBySubject, filterStudentsByRisk, calculateFinalScore } from './utils';

describe('calculateFinalScore', () => {
    it('should calculate correct percentage', () => {
        const assessments = [
            { MaxScore: 50, ScoreObtained: 40 }, // 80%
            { MaxScore: 50, ScoreObtained: 50 }  // 100%
        ];
        // Total: 90/100 = 90%
        expect(calculateFinalScore(assessments)).toBe(90);
    });

    it('should ignore assessments with null scores', () => {
        const assessments = [
            { MaxScore: 50, ScoreObtained: 50 },
            { MaxScore: 50, ScoreObtained: null }
        ];
        // Should only count the first one: 50/50 = 100%
        expect(calculateFinalScore(assessments)).toBe(100);
    });

    it('should return 0 if total max score is 0', () => {
        const assessments = [];
        expect(calculateFinalScore(assessments)).toBe(0);
    });
});


describe('filterStudentsBySubject', () => {
    const students = [
        { id: 1, subjects: [{ name: 'Math' }, { name: 'Science' }] },
        { id: 2, subjects: [{ name: 'History' }] },
        { id: 3, subjects: [{ name: 'Math' }] }
    ];

    it('should return all students if no subject filter is provided', () => {
        expect(filterStudentsBySubject(students, '')).toEqual(students);
        expect(filterStudentsBySubject(students, null)).toEqual(students);
    });

    it('should filter students by subject', () => {
        const result = filterStudentsBySubject(students, 'Math');
        expect(result).toHaveLength(2);
        expect(result.map(s => s.id)).toContain(1);
        expect(result.map(s => s.id)).toContain(3);
    });

    it('should return empty array if no student matches', () => {
        const result = filterStudentsBySubject(students, 'Art');
        expect(result).toEqual([]);
    });
});

describe('filterStudentsByRisk', () => {
    const students = [
        { id: 1, risk: 'High' },
        { id: 2, risk: 'Medium' },
        { id: 3, risk: 'Low' },
        { id: 4, risk: 'high' } // Testing case insensitivity
    ];

    it('should return all students if no risk filter is provided', () => {
        expect(filterStudentsByRisk(students, '')).toEqual(students);
    });

    it('should filter students by risk level (case insensitive)', () => {
        const result = filterStudentsByRisk(students, 'high');
        expect(result).toHaveLength(2);
        expect(result.map(s => s.id)).toContain(1);
        expect(result.map(s => s.id)).toContain(4);
    });

    it('should return empty array if no matches', () => {
        const result = filterStudentsByRisk(students, 'Critical');
        expect(result).toEqual([]);
    });
});
