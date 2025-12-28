<script>
    import { enhance } from "$app/forms";
    import { Plus, Edit2, Trash2, BookOpen, X } from "lucide-svelte";

    export let data;
    export let form; // To receive error messages

    $: subjects = data.subjects;

    // --- MODAL STATE MANAGEMENT ---
    let activeModal = null; // 'addSubject', 'editSubject', 'addAssessment', 'editAssessment'
    let selectedItem = null; // Stores the object being edited (subject or assessment)
    let parentID = null; // Stores SubjectID when dealing with assessments

    // Helper to open specific modals
    function openAddSubject() {
        activeModal = "addSubject";
        selectedItem = {};
    }

    function openEditSubject(subject) {
        activeModal = "editSubject";
        selectedItem = { ...subject }; // Copy object to avoid direct mutation
    }

    function openAddAssessment(subjectID) {
        activeModal = "addAssessment";
        parentID = subjectID;
        selectedItem = {};
    }

    function openEditAssessment(assessment) {
        activeModal = "editAssessment";
        selectedItem = { ...assessment };
    }

    function closeModal() {
        activeModal = null;
        selectedItem = null;
        parentID = null;
        // CHANGES OCCUR: Reset form error when closing modal so it doesn't persist
        if (form) form.error = null;
    }
</script>

<div class="w-full max-w-5xl mx-auto">
    <!-- PAGE HEADER -->
    <div class="flex justify-between items-center mb-8">
        <div>
            <h2 class="text-2xl font-bold text-slate-900">Manage Subjects</h2>
            <p class="text-slate-500 mt-1">
                Add subjects and track your assessment scores.
            </p>
        </div>
        <!-- ADD SUBJECT BUTTON -->
        <button
            on:click={openAddSubject}
            class="bg-edu-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition shadow-sm"
        >
            <Plus size={18} /> Add Subject
        </button>
    </div>

    <!-- SUBJECT LIST -->
    <div class="space-y-8">
        {#each subjects as sub}
            <div
                class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
                <!-- Subject Header -->
                <div
                    class="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center group"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="p-2 bg-white border border-slate-200 rounded-lg text-edu-blue"
                        >
                            <BookOpen size={20} />
                        </div>
                        <h3 class="font-bold text-lg text-slate-800">
                            {sub.SubjectName}
                        </h3>

                        <!-- Subject Actions (Edit/Delete) -->
                        <div
                            class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        >
                            <button
                                on:click={() => openEditSubject(sub)}
                                class="p-1 text-slate-400 hover:text-blue-600 rounded"
                            >
                                <Edit2 size={16} />
                            </button>
                            <form
                                method="POST"
                                action="?/deleteSubject"
                                use:enhance={({ cancel }) => {
                                    if (
                                        !confirm(
                                            "Delete this subject and all its assessments?",
                                        )
                                    )
                                        cancel();
                                    return async ({ update }) => {
                                        await update();
                                    };
                                }}
                            >
                                <input
                                    type="hidden"
                                    name="subjectID"
                                    value={sub.subjectID}
                                />
                                <button
                                    class="p-1 text-slate-400 hover:text-red-600 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </form>
                        </div>
                    </div>

                    <button
                        on:click={() => openAddAssessment(sub.subjectID)}
                        class="text-sm font-bold text-edu-blue hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition flex items-center gap-1"
                    >
                        <Plus size={14} /> Add Assessment
                    </button>
                </div>

                <!-- Assessment Table -->
                <div class="p-4">
                    {#if sub.assessments.length > 0}
                        <table
                            class="w-full text-left border-collapse text-sm table-fixed"
                        >
                            <thead>
                                <tr
                                    class="text-slate-400 border-b border-slate-100"
                                >
                                    <th
                                        class="py-2 font-semibold uppercase text-xs w-1/2"
                                        >Assessment Name</th
                                    >
                                    <th
                                        class="py-2 font-semibold uppercase text-xs w-1/4"
                                        >Score / Max</th
                                    >
                                    <th
                                        class="py-2 font-semibold uppercase text-xs w-1/4 text-right"
                                        >Actions</th
                                    >
                                </tr>
                            </thead>
                            <tbody>
                                {#each sub.assessments as asm}
                                    <tr
                                        class="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 group"
                                    >
                                        <td
                                            class="py-3 font-medium text-slate-700 truncate pr-4"
                                            title={asm.AssessmentName}
                                            >{asm.AssessmentName}</td
                                        >
                                        <td class="py-3 text-slate-600">
                                            {#if asm.ScoreObtained !== null}
                                                <span
                                                    class="font-bold text-slate-800"
                                                    >{asm.ScoreObtained}</span
                                                >
                                                <span class="text-slate-400"
                                                    >/ {asm.MaxScore}</span
                                                >
                                            {:else}
                                                <span
                                                    class="text-slate-400 italic"
                                                    >Pending / {asm.MaxScore}</span
                                                >
                                            {/if}
                                        </td>
                                        <td
                                            class="py-3 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <button
                                                on:click={() =>
                                                    openEditAssessment(asm)}
                                                class="text-slate-400 hover:text-blue-600 transition p-1"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <form
                                                method="POST"
                                                action="?/deleteAssessment"
                                                use:enhance={({ cancel }) => {
                                                    if (
                                                        !confirm(
                                                            "Delete this assessment?",
                                                        )
                                                    )
                                                        cancel();
                                                    return async ({
                                                        update,
                                                    }) => {
                                                        await update();
                                                    };
                                                }}
                                            >
                                                <input
                                                    type="hidden"
                                                    name="assessmentID"
                                                    value={asm.AssessmentID}
                                                />
                                                <button
                                                    class="text-slate-400 hover:text-red-600 transition p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {:else}
                        <div
                            class="text-center py-6 text-slate-400 italic text-sm"
                        >
                            No assessments added yet.
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>

    <!-- === MODALS === -->

    <!-- 1. SUBJECT MODAL (Shared for Add & Edit) -->
    {#if activeModal === "addSubject" || activeModal === "editSubject"}
        <div
            class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-slate-800">
                        {activeModal === "addSubject"
                            ? "Add Subject"
                            : "Edit Subject"}
                    </h3>
                    <button
                        on:click={closeModal}
                        class="text-slate-400 hover:text-slate-600"
                        ><X size={20} /></button
                    >
                </div>

                <form
                    method="POST"
                    action={activeModal === "addSubject"
                        ? "?/addSubject"
                        : "?/updateSubject"}
                    use:enhance={() => {
                        return async ({ update }) => {
                            await update();
                            closeModal();
                        };
                    }}
                >
                    {#if activeModal === "editSubject"}
                        <input
                            type="hidden"
                            name="subjectID"
                            value={selectedItem.subjectID}
                        />
                    {/if}

                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Subject Name</label
                    >
                    <input
                        name="subjectName"
                        type="text"
                        value={selectedItem.SubjectName || ""}
                        class="w-full border border-slate-300 rounded-lg px-3 py-2 mb-6 focus:ring-2 focus:ring-blue-100 outline-none"
                        required
                    />

                    <div class="flex justify-end gap-3">
                        <button
                            type="button"
                            on:click={closeModal}
                            class="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                            >Cancel</button
                        >
                        <button
                            type="submit"
                            class="bg-edu-blue hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg"
                        >
                            {activeModal === "addSubject" ? "Add" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    <!-- 2. ASSESSMENT MODAL (Shared for Add & Edit) -->
    {#if activeModal === "addAssessment" || activeModal === "editAssessment"}
        <div
            class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-slate-800">
                        {activeModal === "addAssessment"
                            ? "Add Assessment"
                            : "Edit Assessment"}
                    </h3>
                    <button
                        on:click={closeModal}
                        class="text-slate-400 hover:text-slate-600"
                        ><X size={20} /></button
                    >
                </div>

                <!-- CHANGES OCCUR: Added Error Display -->
                {#if form?.error}
                    <div
                        class="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"
                    >
                        {form.error}
                    </div>
                {/if}

                <form
                    method="POST"
                    action={activeModal === "addAssessment"
                        ? "?/addAssessment"
                        : "?/updateAssessment"}
                    use:enhance={() => {
                        return async ({ result, update }) => {
                            // If success, close modal. If error, keep modal open to show error.
                            if (result.type === "success") {
                                await update();
                                // Check if the action successfully returned { success: true }
                                if (result.data && result.data.success) {
                                    closeModal();
                                } else if (
                                    result.data &&
                                    result.data.success === false
                                ) {
                                    // Handle explicit failure returned as data
                                    // The form prop will be updated automatically by await update()
                                }
                            } else if (result.type === "failure") {
                                await update(); // This ensures form prop is updated with the error
                            } else {
                                await update();
                            }
                        };
                    }}
                >
                    <!-- Hidden IDs -->
                    {#if activeModal === "addAssessment"}
                        <input
                            type="hidden"
                            name="subjectID"
                            value={parentID}
                        />
                    {:else}
                        <input
                            type="hidden"
                            name="assessmentID"
                            value={selectedItem.AssessmentID}
                        />
                    {/if}

                    <div class="mb-4">
                        <label
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >Assessment Name</label
                        >
                        <input
                            name="name"
                            type="text"
                            value={selectedItem.AssessmentName || ""}
                            class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-edu-blue"
                            required
                        />
                    </div>

                    <div class="flex gap-4 mb-6">
                        <div class="flex-1">
                            <label
                                class="block text-sm font-semibold text-slate-700 mb-2"
                                >Max Score (%)</label
                            >
                            <input
                                name="maxScore"
                                type="number"
                                step="0.01"
                                value={selectedItem.MaxScore || ""}
                                class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-edu-blue"
                                required
                            />
                        </div>
                        <div class="flex-1">
                            <label
                                class="block text-sm font-semibold text-slate-700 mb-2"
                                >Score Obtained</label
                            >
                            <!-- Note: type="number" step="0.01" allows decimals -->
                            <input
                                name="scoreObtained"
                                type="number"
                                step="0.01"
                                value={selectedItem.ScoreObtained ?? ""}
                                class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-edu-blue"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div class="flex justify-end gap-3">
                        <button
                            type="button"
                            on:click={closeModal}
                            class="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                            >Cancel</button
                        >
                        <button
                            type="submit"
                            class="bg-edu-blue hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg"
                        >
                            {activeModal === "addAssessment" ? "Add" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}
</div>

<!-- **Key Changes:**
1.  **Backend Validation:** Checks total `MaxScore` in DB before inserting/updating.
2.  **Frontend Error Handling:** `{#if form?.error}` block added to the modal.
3.  **Enhance Logic:** Modified `use:enhance` to keep the modal open if an error occurs (`result.type !== 'success'`), allowing the user to see the warning and correct their input. -->
