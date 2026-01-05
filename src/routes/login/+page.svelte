<script>
    export let form;
    let role = 'student';
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6 text-edu-blue">
            {role === 'student' ? 'Student Login' : 'Lecturer Login'}
        </h1>

        {#if form?.error}
            <div class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
                {form.error}
            </div>
        {/if}

        <form method="POST">
            <!-- ROLE -->
            <div class="mb-4">
                <label class="block text-sm font-bold mb-2">Login As</label>
                <select name="role" bind:value={role} class="w-full border rounded p-2">
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                </select>
            </div>

            <!-- ID -->
            <div class="mb-4">
                <label class="block text-sm font-bold mb-2">
                    {role === 'student' ? 'Student ID' : 'Lecturer ID'}
                </label>
                <input
                    name="userID"
                    type="text"
                    class="w-full border rounded p-2"
                    required
                >
            </div>

            <!-- PASSWORD -->
            <div class="mb-6">
                <label class="block text-sm font-bold mb-2">Password</label>
                <input
                    name="password"
                    type="password"
                    class="w-full border rounded p-2"
                    required
                >
            </div>

            <button class="w-full bg-edu-blue text-white font-bold py-2 rounded hover:bg-blue-600 transition">
                Login
            </button>
        </form>
    </div>
</div>
