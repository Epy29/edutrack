<script>
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";

  let canvas;
  let barCanvas;
  let studentPromise = Promise.resolve([]);
  let searchQuery = "";
  let studentsData = []; // Store raw data for filtering

  $: filteredStudents = studentsData.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toString().includes(searchQuery),
  );

  onMount(async () => {
    // Start fetching stats
    const res = await fetch("/api/lecturer/analytics");
    const data = await res.json();

    // Start fetching student list
    studentPromise = fetch("/api/lecturer/students")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) studentsData = data;
        return data;
      });

    // Pie Chart (Risk Distribution)
    new Chart(canvas, {
      type: "pie",
      data: {
        labels: ["Low Risk", "Medium Risk", "High Risk"],
        datasets: [
          {
            data: [data.low, data.medium, data.high],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
      },
    });

    // Bar Chart (Subject Performance)
    if (data.subjects && data.subjects.length > 0) {
      new Chart(barCanvas, {
        type: "bar",
        data: {
          labels: data.subjects,
          datasets: [
            {
              label: "Average Class Score (%)",
              data: data.scores,
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

<div class="search-bar">
  <input
    type="text"
    placeholder="Search by Name or ID..."
    bind:value={searchQuery}
    class="search-input"
  />
</div>

<div class="student-list">
  {#await studentPromise}
    <p>Loading students...</p>
  {:then students}
    {#if students.error}
      <p class="error">{students.error}</p>
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
                                    ? parseFloat(subject.attendance).toFixed(
                                        1,
                                      ) + "%"
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
  {:catch error}
    <p class="error">Failed to load students.</p>
  {/await}
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
</style>
