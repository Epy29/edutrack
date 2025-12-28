<script>
    import "../app.css";
    import { page } from "$app/stores";
    import {
        Menu,
        User,
        LayoutDashboard,
        Sparkles,
        BookOpen,
        LogOut,
        ChevronLeft,
    } from "lucide-svelte";

    export let data;

    let isSidebarOpen = false;

    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
    }

    // NEW: Function to close sidebar when a link is clicked (for mobile)
    function closeSidebar() {
        isSidebarOpen = false;
    }

    $: isLoginPage = $page.url.pathname === "/login";
</script>

{#if isLoginPage}
    <div
        class="min-h-screen bg-gray-100 flex flex-col justify-center font-sans"
    >
        <slot />
    </div>
{:else}
    <div class="min-h-screen bg-[#f3f6fb] font-sans flex flex-col">
        <!-- HEADER -->
        <header
            class="fixed top-0 left-0 w-full h-[64px] bg-edu-blue text-white px-5 flex justify-between items-center shadow-md z-50"
        >
            <button
                on:click={toggleSidebar}
                class="text-white hover:bg-white/20 p-2 rounded-lg transition focus:outline-none"
            >
                <Menu size={24} />
            </button>

            <h1 class="text-xl font-bold tracking-wide">EduTrack</h1>

            <div class="flex items-center gap-3">
                <div class="hidden sm:block text-right">
                    <div class="text-sm font-medium">
                        {data.student?.studentName || "Guest"}
                    </div>
                    <div class="text-[10px] uppercase opacity-80 font-bold">
                        {data.student?.studentID || ""}
                    </div>
                </div>
                <div
                    class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30"
                >
                    <User size={20} class="text-white" />
                </div>
            </div>
        </header>

        <!-- SIDEBAR -->
        {#if isSidebarOpen}
            <!-- Clicking the overlay also closes the sidebar -->
            <button
                class="fixed inset-0 bg-black/20 z-40 lg:hidden"
                on:click={closeSidebar}
            ></button>
        {/if}

        <aside
            class={`
            fixed top-0 left-0 h-full w-[230px] bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out flex flex-col
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
            <div
                class="flex justify-between items-center p-5 border-b border-gray-100 h-[64px]"
            >
                <h3 class="font-bold text-gray-700 text-lg m-0">Menu</h3>
                <button
                    on:click={closeSidebar}
                    class="text-gray-500 hover:text-red-500 transition"
                >
                    <ChevronLeft size={24} />
                </button>
            </div>

            <nav class="p-4 space-y-2 flex-1 overflow-y-auto">
                <!-- 
                    ADDED: on:click={closeSidebar} to all links 
                    This ensures the menu slides away after user selection
                -->
                <a
                    href="/student-portal"
                    on:click={closeSidebar}
                    class="flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-edu-pale hover:text-edu-blue rounded-md transition-colors text-[15px] font-medium"
                >
                    <LayoutDashboard size={18} /> Dashboard
                </a>

                <a
                    href="/student-profile"
                    on:click={closeSidebar}
                    class="flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-edu-pale hover:text-edu-blue rounded-md transition-colors text-[15px] font-medium"
                >
                    <User size={18} /> My Profile
                </a>

                <a
                    href="/subject"
                    on:click={closeSidebar}
                    class="flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-edu-pale hover:text-edu-blue rounded-md transition-colors text-[15px] font-medium"
                >
                    <BookOpen size={18} /> Subject
                </a>

                <a
                    href="/"
                    on:click={closeSidebar}
                    class="flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-edu-pale hover:text-edu-blue rounded-md transition-colors text-[15px] font-medium"
                >
                    <Sparkles size={18} /> Career Prediction
                </a>

                <a
                    href="/history"
                    on:click={closeSidebar}
                    class="flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-edu-pale hover:text-edu-blue rounded-md transition-colors text-[15px] font-medium"
                >
                    <BookOpen size={18} /> Academic History
                </a>
            </nav>

            <div class="p-4 border-t border-gray-100 mb-[50px]">
                <a
                    href="/logout"
                    on:click={closeSidebar}
                    class="flex w-full items-center gap-3 px-3 py-3 text-gray-400 hover:text-red-600 rounded-md transition-colors text-[15px] font-medium"
                >
                    <LogOut size={18} /> Logout
                </a>
            </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main
            class="flex-1 pt-[80px] pb-[100px] px-4 md:px-8 max-w-7xl mx-auto w-full transition-all duration-300"
        >
            <slot />
        </main>

        <!-- FOOTER -->
        <footer
            class="fixed bottom-0 left-0 w-full bg-[#e5e5e5] text-[#555] p-3 text-center text-sm z-40 shadow-inner"
        >
            © 2025 EduTrack. All Rights Reserved.
        </footer>
    </div>
{/if}
