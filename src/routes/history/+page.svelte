<script>
    import {
        Clock3,
        AlertTriangle,
        CheckCircle,
        AlertCircle,
    } from "lucide-svelte";

    export let data;

    function formatDate(dateString) {
        if (!dateString) return "Unknown Date";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
</script>

<div class="max-w-4xl mx-auto w-full">
    <div class="mb-8">
        <h1
            class="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3"
        >
            <Clock3 class="text-edu-blue" /> Prediction History
        </h1>
        <p class="text-slate-500 mt-1">
            A timeline of your AI career assessments.
        </p>
    </div>

    {#if data.predictions && data.predictions.length > 0}
        <div class="space-y-6">
            {#each data.predictions as pred}
                <div
                    class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition hover:shadow-md"
                >
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <div
                                class="text-sm text-slate-400 font-medium mb-1"
                            >
                                {formatDate(pred.CreatedAt)}
                            </div>
                            <span
                                class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold
                                {pred.RiskLevel === 'Low'
                                    ? 'bg-green-100 text-green-700'
                                    : pred.RiskLevel === 'Medium'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'}"
                            >
                                {#if pred.RiskLevel === "Low"}
                                    <CheckCircle size={12} />
                                {:else if pred.RiskLevel === "Medium"}
                                    <AlertCircle size={12} />
                                {:else}
                                    <AlertTriangle size={12} />
                                {/if}
                                Risk: {pred.RiskLevel}
                            </span>
                        </div>
                    </div>

                    <div
                        class="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100"
                    >
                        {@html pred.PredictionText}
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        {#if data.error}
            <div
                class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6"
            >
                <strong>Error loading history:</strong>
                {data.error}
            </div>
        {/if}
        <div
            class="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300"
        >
            <Clock3 size={48} class="mx-auto text-slate-300 mb-4" />
            <h3 class="text-lg font-bold text-slate-500">No History Found</h3>
            <p class="text-slate-400">
                You haven't generated any career predictions yet.
            </p>
            <a
                href="/career-prediction"
                class="mt-4 inline-block text-edu-blue font-bold hover:underline"
            >
                Generate your first prediction &rarr;
            </a>
        </div>
    {/if}
</div>
