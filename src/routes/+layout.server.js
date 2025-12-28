export const load = async () => {
    // 1. Define global student data structure
    // This simulates data fetched from a database
    const studentData = {
        studentID: "2024055",
        studentName: "Ahmad Albab",
        subjects: [
            {
                subjectName: "Culinary Arts",
                assessments: [
                    { name: "Knife Skills Test", scoreObtained: 18, maxScore: 20, weightage: 20 },
                    { name: "Menu Planning", scoreObtained: 25, maxScore: 30, weightage: 30 },
                    { name: "Final Practical", scoreObtained: null, maxScore: 100, weightage: 50 }
                ]
            },
            {
                subjectName: "Food Safety & Hygiene",
                assessments: [
                    { name: "Quiz 1", scoreObtained: 9, maxScore: 10, weightage: 10 },
                    { name: "Hygiene Audit", scoreObtained: 35, maxScore: 40, weightage: 40 },
                    { name: "Final Exam", scoreObtained: null, maxScore: 100, weightage: 50 }
                ]
            },
            {
                subjectName: "Introduction to Baking",
                assessments: [
                    { name: "Bread Making", scoreObtained: 40, maxScore: 50, weightage: 50 },
                    { name: "Pastry Techniques", scoreObtained: 45, maxScore: 50, weightage: 50 }
                ]
            }
        ],
        attendance: 92,
        behavioralRecord: "Creative thinker, works well under pressure in practicals.",
        coCurricularActivity: "Head of Cooking Club",
        interest: "Fine Dining, Baking, inventing new recipes",
        skills: "Knife Skills, Menu Planning, Food Styling"
    };

    // 2. Iterate through subjects to calculate weighted scores
    studentData.subjects = studentData.subjects.map(sub => {
        let totalObtained = 0;
        let totalMax = 0;

        // 3. Aggregate scores for completed assessments
        sub.assessments.forEach(asm => {
            if (asm.scoreObtained !== null) {
                const weightedScore = (asm.scoreObtained / asm.maxScore) * asm.weightage;
                totalObtained += weightedScore;
                totalMax += asm.weightage;
            }
        });

        // 4. Calculate final percentage based on maximum possible score
        const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

        return {
            ...sub,
            calculatedGrade: percentage,
            progress: `${totalObtained.toFixed(1)} / ${totalMax}%`
        };
    });

    // 5. Return processed data to the layout
    return {
        student: studentData
    };
};