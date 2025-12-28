<script>
    export let data;
    // Use a reactive variable so we can update it after generating a new prediction
    $: student = data.student;

    let isGenerating = false;

    async function generatePrediction() {
        isGenerating = true;
        try {
            const res = await fetch("/api/predict", { method: "POST" });
            const result = await res.json();

            if (result.success) {
                // Update the local state to show the new prediction immediately
                student.prediction = {
                    careerTitle: "AI Prediction",
                    description: result.prediction.predictionText,
                    riskLevel: result.prediction.riskLevel,
                };
            } else {
                alert(
                    "Failed to generate prediction: " +
                        (result.error || "Unknown error"),
                );
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to server.");
        } finally {
            isGenerating = false;
        }
    }
</script>

<div class="w-full">
    <!-- Welcome Header -->
    <div class="mb-8">
        <h2 class="text-2xl font-bold text-slate-800">Student Dashboard</h2>
        <p class="text-slate-500 mt-1">
            Welcome back, <strong class="text-slate-900">{student.name}</strong>
        </p>
    </div>

    <!-- PREDICTION SECTION -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-lg text-slate-800">AI Career Analysis</h3>
            <button
                on:click={generatePrediction}
                disabled={isGenerating}
                class="bg-edu-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {#if isGenerating}
                    🔄 Analyzing...
                {:else}
                    ✨ Generate New Prediction
                {/if}
            </button>
        </div>

        {#if student.prediction}
            <!-- If prediction exists in DB -->
            <div class="p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="text-xl font-bold text-edu-blue">
                        Performance Analysis
                    </h4>
                    <span
                        class="px-3 py-1 rounded-full text-xs font-bold
                        {student.prediction.riskLevel === 'Low'
                            ? 'bg-green-100 text-green-700'
                            : student.prediction.riskLevel === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'}"
                    >
                        Risk Level: {student.prediction.riskLevel || "Unknown"}
                    </span>
                </div>
                <p
                    class="text-slate-600 mb-4 leading-relaxed whitespace-pre-wrap"
                >
                    {@html student.prediction.description}
                </p>
            </div>
        {:else}
            <!-- If NO prediction (Null State) -->
            <div
                class="flex flex-col items-center justify-center py-12 text-center"
            >
                <div
                    class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-4xl"
                >
                    🔮
                </div>
                <h4 class="font-bold text-slate-400 mb-2">No Prediction Yet</h4>
                <p class="text-sm text-slate-400 max-w-sm">
                    You haven't generated a career prediction yet. Click the
                    button above to start the AI analysis.
                </p>
            </div>
        {/if}
    </div>

    <!-- ACADEMIC TABLE -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="font-bold text-lg text-slate-800 mb-6">
            Recent Academic Performance
        </h3>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-slate-200">
                        <th
                            class="py-3 px-2 text-sm font-bold text-slate-500 uppercase tracking-wider"
                            >Subject Name</th
                        >
                        <th
                            class="py-3 px-2 text-sm font-bold text-slate-500 uppercase tracking-wider"
                            >Calculated Score</th
                        >
                        <th
                            class="py-3 px-2 text-sm font-bold text-slate-500 uppercase tracking-wider"
                            >Attendance</th
                        >
                    </tr>
                </thead>
                <tbody class="text-sm text-slate-700">
                    {#if student.subjects && student.subjects.length > 0}
                        {#each student.subjects as sub}
                            <tr
                                class="border-b border-slate-50 hover:bg-slate-50 transition"
                            >
                                <td class="py-4 px-2 font-medium"
                                    >{sub.SubjectName}</td
                                >
                                <td class="py-4 px-2">
                                    {#if sub.CalculatedScore}
                                        <span
                                            class="font-bold {sub.CalculatedScore >=
                                            80
                                                ? 'text-green-600'
                                                : 'text-slate-700'}"
                                        >
                                            {sub.CalculatedScore}%
                                        </span>
                                    {:else}
                                        <span class="text-slate-400 italic"
                                            >--</span
                                        >
                                    {/if}
                                </td>
                                <td class="py-4 px-2">
                                    {#if sub.Attendance}
                                        {sub.Attendance}%
                                    {:else}
                                        <span class="text-slate-400 italic"
                                            >--</span
                                        >
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    {:else}
                        <tr>
                            <td
                                colspan="3"
                                class="py-8 text-center text-slate-400 italic"
                                >No subjects enrolled.</td
                            >
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>
