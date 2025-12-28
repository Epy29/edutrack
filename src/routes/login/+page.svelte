<script>
    export let form; // Gets error messages from server
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6 text-edu-blue">Student Login</h1>
        
        {#if form?.error}
            <div class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
                {form.error}
            </div>
        {/if}

        <form method="POST">
            <div class="mb-4">
                <label class="block text-sm font-bold mb-2">Student ID</label>
                <input name="studID" type="text" class="w-full border rounded p-2" placeholder="e.g. 2025123456" required>
            </div>
            
            <div class="mb-6">
                <label class="block text-sm font-bold mb-2">Password</label>
                <input name="password" type="password" class="w-full border rounded p-2" placeholder="********" required>
            </div>

            <button class="w-full bg-edu-blue text-white font-bold py-2 rounded hover:bg-blue-600 transition">
                Login
            </button>
        </form>
    </div>
</div>