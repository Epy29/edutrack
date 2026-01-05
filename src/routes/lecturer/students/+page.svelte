<script>
  let students = [];

  $: fetch('/api/lecturer/students')
    .then(r => r.json())
    .then(d => students = d);
</script>

<h2>Students</h2>

<table>
  {#each students as s}
    <tr>
      <td>{s.name}</td>
      <td>{s.risk}</td>
      <td>
        <a href={`/lecturer/students/${s.id}`}>View</a>
      </td>
    </tr>
  {/each}
</table>
