<!-- ERROR: after save editted data, form is blank. Reload needed to see the data -->

<script>
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    
    export let data; 
    export let form; 

    // REACTIVE: Update local student object when data changes
    $: student = data.student || {};

    let isEditing = false;
    let loading = false;

    function toggleEdit() {
        isEditing = !isEditing;
    }
</script>

<div class="w-full max-w-4xl mx-auto">
    
    <div class="mb-8">
        <h2 class="text-2xl font-bold text-slate-900">Manage Profile</h2>
        <p class="text-slate-500 mt-1">Update your academic and personal details for accurate AI predictions.</p>
    </div>

    <!-- Success Notification -->
    {#if form?.success}
        <div class="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span class="font-bold">✓</span> Profile updated successfully!
        </div>
    {/if}

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        
        <div class="absolute top-6 right-6 z-10">
            {#if !isEditing}
                <button on:click={toggleEdit} class="flex items-center gap-2 text-sm font-bold text-edu-blue hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition">
                    ✎ Edit Data
                </button>
            {:else}
                <button on:click={toggleEdit} class="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2">
                    Cancel
                </button>
            {/if}
        </div>

        <form method="POST" action="?/update" use:enhance={() => {
            loading = true;
            return async ({ update }) => {
                loading = false;
                isEditing = false; 
                await update(); 
                await invalidateAll(); 
            };
        }} class="p-8">

            <!-- 1. Personal Info (Read Only) -->
            <!-- CHECK: Using Capitalized Property Names to match MySQL -->
             
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">Personal Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Student Name</label>
                    <input type="text" value={student.Username || ''} disabled class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Student ID</label>
                    <input type="text" value={student.StudID || ''} disabled class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input type="text" value={student.Email || ''} disabled class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Class</label>
                    <input type="text" value={student.ClassID || ''} disabled class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-500 cursor-not-allowed">
                </div>
            </div>

            <!-- 2. Attendance -->
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">Academic Stats</h4>
            <div class="mb-8">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Attendance Average (%)</label>
                <div class="relative">
                    <input type="text" value={student.attendanceAvg}% disabled class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700 font-bold">
                    <span class="absolute right-4 top-2.5 text-xs text-slate-400">Calculated from Subjects</span>
                </div>
            </div>

            <!-- 3. Skills & Interests -->
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">Skills & Interests</h4>
            <div class="space-y-6">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Technical Skills</label>
                    <input name="skills" type="text" value={student.Skills || ''} disabled={!isEditing} 
                        class="w-full border rounded-lg px-4 py-2 transition-colors 
                        {isEditing ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600'}">
                </div>

                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Interests / Hobbies</label>
                    <textarea name="interest" rows="2" disabled={!isEditing}
                        class="w-full border rounded-lg px-4 py-2 transition-colors resize-none
                        {isEditing ? 'bg-white border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600'}">{student.Interest || ''}</textarea>
                </div>
            </div>

            {#if isEditing}
                <div class="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button disabled={loading} class="bg-edu-blue hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-100 transition transform active:scale-95 disabled:opacity-70">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            {/if}

        </form>
    </div>
</div>