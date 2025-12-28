<script>
    import { enhance } from '$app/forms';
    import { Activity, Award, BookOpen, Briefcase, Sparkles } from 'lucide-svelte';

    export let data; 
    export let form; 

    // Safety check
    $: student = data?.student || {
        studentName: "Guest Student",
        studentID: "---",
        attendance: 0,
        behavioralRecord: "No data",
        coCurricularActivity: "No data",
        subjects: [],
        skills: "",
        interest: ""
    };
    
    let loading = false;
</script>

<div class="w-full">
    <!-- Page Title -->
    <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Career Prediction</h1>
        <p class="text-slate-500 mt-1">AI analysis based on your academic & behavioral profile</p>
    </div>

    <!-- 1. SUMMARY STATS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Activity size={24} /></div>
            <div><div class="text-xs text-slate-400 uppercase font-bold tracking-wider">Attendance</div><div class="text-2xl font-bold text-slate-800">{student.attendance}%</div></div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><Award size={24} /></div>
            <div class="overflow-hidden"><div class="text-xs text-slate-400 uppercase font-bold tracking-wider">Behavior</div><div class="text-sm font-medium text-slate-800 truncate" title={student.behavioralRecord}>{student.behavioralRecord}</div></div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600"><Award size={24} /></div>
            <div class="overflow-hidden"><div class="text-xs text-slate-400 uppercase font-bold tracking-wider">Co-Curriculum</div><div class="text-sm font-medium text-slate-800 truncate" title={student.coCurricularActivity}>{student.coCurricularActivity}</div></div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- 2. LEFT COLUMN: Data Overview -->
        <div class="lg:col-span-1 space-y-6">
            
            <!-- Academic Standing Card (With Assessments) -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 class="font-bold text-slate-800 mb-5 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <BookOpen size={16} class="text-blue-500"/> Academic Standing
                </h3>
                
                <div class="space-y-4">
                    {#if student.subjects && student.subjects.length > 0}
                        {#each student.subjects as sub}
                            <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                
                                <!-- Subject Header -->
                                <div class="flex justify-between items-center mb-2">
                                    <span class="font-bold text-slate-700 text-sm">{sub.subjectName}</span>
                                    <div class="text-right">
                                        <span class="block text-lg font-bold {sub.calculatedGrade >= 80 ? 'text-blue-600' : 'text-slate-600'}">
                                            {sub.calculatedGrade}%
                                        </span>
                                    </div>
                                </div>

                                <!-- Progress Bar -->
                                <div class="w-full bg-slate-200 rounded-full h-1.5 mb-3">
                                    <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style="width: {sub.calculatedGrade}%"></div>
                                </div>

                                <!-- Assessments Breakdown -->
                                <div class="space-y-1 pt-2 border-t border-slate-200/50">
                                    {#each sub.assessments as asm}
                                        <div class="flex justify-between text-[11px] text-slate-500">
                                            <span>{asm.name}</span>
                                            {#if asm.scoreObtained !== null}
                                                <span class="font-medium text-slate-700">
                                                    {asm.scoreObtained}/{asm.maxScore} 
                                                </span>
                                            {:else}
                                                <span class="text-slate-400 italic">Pending</span>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>

                            </div>
                        {/each}
                    {:else}
                        <div class="text-sm text-slate-400 italic">No subjects recorded</div>
                    {/if}
                </div>
            </div>

            <!-- Profile Details Card -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 class="font-bold text-slate-800 mb-5 flex items-center gap-2 text-sm uppercase tracking-wide"><Award size={16} class="text-blue-500"/> Profile Details</h3>
                <div class="mb-5"><div class="text-xs font-bold text-slate-400 mb-2">Technical Skills</div><div class="flex flex-wrap gap-2">{#if student.skills}{#each student.skills.split(',') as skill}<span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium border border-blue-100">{skill.trim()}</span>{/each}{:else}<span class="text-slate-400 text-xs">No skills listed</span>{/if}</div></div>
                <div><div class="text-xs font-bold text-slate-400 mb-2">Interests</div><div class="flex flex-wrap gap-2">{#if student.interest}{#each student.interest.split(',') as interest}<span class="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md font-medium border border-indigo-100">{interest.trim()}</span>{/each}{:else}<span class="text-slate-400 text-xs">No interests listed</span>{/if}</div></div>
            </div>

            <!-- Prediction Button Form -->
            <form method="POST" action="?/predict" use:enhance={() => { loading = true; return async ({ update }) => { loading = false; update(); }; }}>
                <input type="hidden" name="studentName" value={student.studentName}>
                <input type="hidden" name="subjects" value={JSON.stringify(student.subjects)}>
                <input type="hidden" name="attendance" value={student.attendance}>
                <input type="hidden" name="behavior" value={student.behavioralRecord}>
                <input type="hidden" name="skills" value={student.skills}>
                <input type="hidden" name="interest" value={student.interest}>

                <!-- Custom Blue Button -->
                <button disabled={loading} class="w-full bg-edu-blue hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70">
                    {#if loading} <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> Analyzing... {:else} <Sparkles size={20} /> Generate Prediction {/if}
                </button>
            </form>
        </div>

        <!-- 3. RIGHT COLUMN: Results -->
        <div class="lg:col-span-2">
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full min-h-[500px] relative overflow-hidden">
                {#if form?.success}
                    <div class="absolute top-0 left-0 w-full h-1 bg-edu-blue"></div>
                    <div class="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                        <div class="p-2 bg-blue-100 text-blue-600 rounded-lg"><Sparkles size={24} /></div>
                        <div><h2 class="text-xl font-bold text-slate-800">AI Career Analysis</h2><p class="text-xs text-slate-400">Generated just now</p></div>
                    </div>
                    <div class="prose prose-sm max-w-none text-slate-600">{@html form.predictionResult}</div>
                {:else}
                    <div class="h-full flex flex-col items-center justify-center text-slate-300">
                        <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Briefcase size={40} class="opacity-50"/></div>
                        <h3 class="text-lg font-bold text-slate-400">No Prediction Yet</h3>
                        <p class="text-sm max-w-xs text-center mt-2">Click "Generate Prediction" to start.</p>
                    </div>
                {/if}
            </div>
        </div>

    </div>
</div>