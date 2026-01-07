<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Chart from "chart.js/auto";

  // Receive data from +page.server.js
  export let data;

  let canvas;
  let barCanvas;
  let searchQuery = "";

  // Reactive data from server
  $: studentsData = data.students || [];
  $: analytics = data.analytics || {};
  $: allSubjects = data.allSubjects || [];
  $: currentFilters = data.filters || {};

  // Client-side search filter (on top of server-side filters)
  $: filteredStudents = studentsData.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toString().includes(searchQuery),
  );

  // Filter state (synced from URL params)
  let selectedSubject = "";
  let selectedRisk = "";

  // Sync filter dropdowns with URL params on data change
  $: {
    selectedSubject = currentFilters.subject || "";
    selectedRisk = currentFilters.risk || "";
  }

  // Apply filters by navigating to URL with params
  function applyFilters() {
    const params = new URLSearchParams();
    if (selectedSubject) params.set("subject", selectedSubject);
    if (selectedRisk) params.set("risk", selectedRisk);
    goto(`?${params.toString()}`);
  }

  // Clear all filters
  function clearFilters() {
    selectedSubject = "";
    selectedRisk = "";
    goto("?");
  }

  onMount(() => {
    // Pie Chart (Risk Distribution)
    if (canvas && analytics.low !== undefined) {
      new Chart(canvas, {
        type: "pie",
        data: {
          labels: ["Low Risk", "Medium Risk", "High Risk"],
          datasets: [
            {
              data: [analytics.low, analytics.medium, analytics.high],
              backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
        },
      });
    }

    // Bar Chart (Subject Performance)
    if (barCanvas && analytics.subjects && analytics.subjects.length > 0) {
      new Chart(barCanvas, {
        type: "bar",
        data: {
          labels: analytics.subjects,
          datasets: [
            {
              label: "Average Class Score (%)",
              data: analytics.scores,
              backgroundColor: "#3b82f6",
              borderRadius: 4,
            },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: true, max: 100 },
          },
        },
      });
    }
  });
</script>

<h1>Lecturer Dashboard</h1>

<div class="charts-container">
  <div class="chart-box">
    <h3>Risk Distribution</h3>
    <div class="canvas-wrapper icon-container">
      <canvas bind:this={canvas}></canvas>
    </div>
  </div>
  <div class="chart-box">
    <h3>Subject Performance</h3>
    <canvas bind:this={barCanvas}></canvas>
  </div>
</div>

<hr />

<h2>Student Overview</h2>

<div class="filter-bar">
  <input
    type="text"
    placeholder="Search by Name or ID..."
    bind:value={searchQuery}
    class="search-input"
  />

  <select
    bind:value={selectedSubject}
    on:change={applyFilters}
    class="filter-select"
  >
    <option value="">All Subjects</option>
    {#each allSubjects as subject}
      <option value={subject}>{subject}</option>
    {/each}
  </select>

  <select
    bind:value={selectedRisk}
    on:change={applyFilters}
    class="filter-select"
  >
    <option value="">All Risk Levels</option>
    <option value="High">High Risk</option>
    <option value="Medium">Medium Risk</option>
    <option value="Low">Low Risk</option>
  </select>

  {#if selectedSubject || selectedRisk}
    <button class="clear-btn" on:click={clearFilters}>Clear Filters</button>
  {/if}
</div>

{#if selectedSubject || selectedRisk}
  <div class="active-filters">
    {#if selectedSubject}
      <span class="filter-tag subject">
        📚 {selectedSubject}
        <button
          on:click={() => {
            selectedSubject = "";
            applyFilters();
          }}>✕</button
        >
      </span>
    {/if}
    {#if selectedRisk}
      <span class="filter-tag risk-{selectedRisk.toLowerCase()}">
        ⚠️ {selectedRisk}
        <button
          on:click={() => {
            selectedRisk = "";
            applyFilters();
          }}>✕</button
        >
      </span>
    {/if}
  </div>
{/if}

<div class="student-list">
  {#if data.error}
    <p class="error">{data.error}</p>
  {:else if filteredStudents.length === 0}
    <p class="no-data">No students found.</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Risk Level</th>
          <th>Latest Prediction</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredStudents as student}
          <tr>
            <td>{student.id}</td>
            <td>{student.name}</td>
            <td class="risk-{student.risk.toLowerCase().replace(' ', '-')}"
              >{student.risk}</td
            >
            <td>
              {student.prediction}
            </td>
            <td>
              <button
                class="expand-btn"
                on:click={() => (student.expanded = !student.expanded)}
              >
                {student.expanded ? "Hide" : "View Full"}
              </button>
            </td>
          </tr>
          {#if student.expanded}
            <tr>
              <td colspan="5" class="full-details-row">
                <div class="details-container">
                  <!-- Profile Section -->
                  <div class="details-section">
                    <h4>Student Profile</h4>
                    <div class="info-grid">
                      <div class="info-item">
                        <strong>Skills:</strong>
                        <span>{student.skills}</span>
                      </div>
                      <div class="info-item">
                        <strong>Interests:</strong>
                        <span>{student.interest}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Academic Section -->
                  <div class="details-section">
                    <h4>Academic Performance</h4>
                    {#if student.subjects && student.subjects.length > 0}
                      <table class="nested-table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Score</th>
                            <th>Attendance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {#each student.subjects as subject}
                            <tr>
                              <td>{subject.name}</td>
                              <td
                                >{subject.score
                                  ? parseFloat(subject.score).toFixed(1) + "%"
                                  : "N/A"}</td
                              >
                              <td
                                >{subject.attendance
                                  ? parseFloat(subject.attendance).toFixed(1) +
                                    "%"
                                  : "N/A"}</td
                              >
                            </tr>
                          {/each}
                        </tbody>
                      </table>
                    {:else}
                      <p class="no-data">No subject data available.</p>
                    {/if}
                  </div>

                  <!-- Analysis Section -->
                  <div class="details-section">
                    <h4>AI Risk Analysis</h4>
                    <div class="html-content">
                      {@html student.predictionFull}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .search-bar {
    margin-bottom: 20px;
  }
  .search-input {
    width: 100%;
    max-width: 400px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
  }
  .charts-container {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }
  .chart-box {
    flex: 1;
    min-width: 300px;
    background: white;
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }
  .canvas-wrapper {
    position: relative;
    height: 250px;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  h3 {
    margin-top: 0;
    font-size: 1.1rem;
    color: #374151;
    margin-bottom: 15px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  th,
  td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
  }
  th {
    background-color: #f4f4f4;
  }
  .risk-high {
    color: red;
    font-weight: bold;
  }
  .risk-medium {
    color: orange;
    font-weight: bold;
  }
  .risk-low {
    color: green;
  }
  .risk-not-assessed {
    color: #999;
    font-style: italic;
  }
  .expand-btn {
    padding: 5px 10px;
    font-size: 0.8rem;
    cursor: pointer;
    background: #eee;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .full-details-row {
    background: #f8fafc;
    padding: 0;
    border-bottom: 2px solid #e2e8f0;
  }
  .details-container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .details-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .details-section h4 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #1f2937;
    font-size: 1.1rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  .info-grid {
    display: grid;
    gap: 15px;
  }
  .info-item {
    display: flex;
    flex-direction: column;
  }
  .info-item strong {
    color: #4b5563;
    font-size: 0.9rem;
    margin-bottom: 4px;
  }
  .info-item span {
    color: #111827;
  }
  .nested-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
  }
  .nested-table th,
  .nested-table td {
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    text-align: left;
  }
  .nested-table th {
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
  }
  .no-data {
    color: #6b7280;
    font-style: italic;
  }
  .html-content {
    /* Keep existing styles or tweak */
    color: #374151;
    line-height: 1.6;
  }

  /* Filter Styles */
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    align-items: center;
  }

  /* Reuse search-input style but override width if needed, or let it flex */
  .search-input {
    width: 100%;
    max-width: 300px; /* Reduced specific width to fit filters */
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
  }

  .filter-select {
    padding: 10px 14px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    min-width: 160px;
  }

  .filter-select:focus {
    outline: 2px solid #3b82f6;
    border-color: #3b82f6;
  }

  .active-filters {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    background: #e5e7eb;
    border: 1px solid #d1d5db;
  }

  .filter-tag.subject {
    background: #dbeafe;
    color: #1e40af;
    border-color: #bfdbfe;
  }
  .filter-tag.risk-high {
    background: #fee2e2;
    color: #b91c1c;
    border-color: #fecaca;
  }
  .filter-tag.risk-medium {
    background: #fef3c7;
    color: #b45309;
    border-color: #fde68a;
  }
  .filter-tag.risk-low {
    background: #d1fae5;
    color: #047857;
    border-color: #a7f3d0;
  }

  .filter-tag button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    padding: 0 2px;
    margin-left: 4px;
    color: inherit;
    display: flex;
    align-items: center;
  }

  .filter-tag button:hover {
    font-weight: bold;
  }

  .clear-btn {
    padding: 10px 16px;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .clear-btn:hover {
    background: #e5e7eb;
  }
</style>
