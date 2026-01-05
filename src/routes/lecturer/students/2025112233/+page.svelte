<script>
  export let data;
</script>

<h2>{data.student.name}</h2>

<h3>Subjects</h3>
<ul>
  {#each data.subjects as sub}
    <li>{sub.name}: {sub.score}%</li>
  {/each}
</ul>

<h3>Prediction</h3>
<p>{data.prediction}</p>
