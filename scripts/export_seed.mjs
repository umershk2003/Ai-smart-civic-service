// Regenerates backend/seed/*.json from the TypeScript seed modules.
// Run: npx tsx scripts/export_seed.mjs
//
// This keeps the FastAPI backend and the React frontend on a single source of
// truth (the TS seeds). Re-run it whenever src/data/seed*.ts or locations.ts
// change, and commit the generated JSON.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialComplaints } from '../src/data/seedData.ts';
import { defaultCategories } from '../src/data/categoriesData.ts';
import { initialAuditLogs } from '../src/data/auditLogData.ts';
import {
  PROVINCES, DIVISIONS, DISTRICTS, TEHSILS, MUNICIPALITIES, WARDS, AREAS,
} from '../src/data/locations.ts';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'backend', 'seed');
mkdirSync(outDir, { recursive: true });

writeFileSync(
  path.join(outDir, 'seed_data.json'),
  JSON.stringify(
    {
      complaints: initialComplaints,
      categories: defaultCategories,
      auditLogs: initialAuditLogs,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);

writeFileSync(
  path.join(outDir, 'locations.json'),
  JSON.stringify(
    {
      provinces: PROVINCES,
      divisions: DIVISIONS,
      districts: DISTRICTS,
      tehsils: TEHSILS,
      municipalities: MUNICIPALITIES,
      wards: WARDS,
      areas: AREAS,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);

console.log(`Seed exported to ${outDir}`);
