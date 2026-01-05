import { json } from '@sveltejs/kit';
import { db } from '$lib/db';

export async function GET() {
  // example only – adapt to your schema
  const [rows] = await db.query(`
    SELECT risk_level, COUNT(*) as count
    FROM predictions
    GROUP BY risk_level
  `);

  const result = { low: 0, medium: 0, high: 0 };
  rows.forEach(r => result[r.risk_level] = r.count);

  return json(result);
}
