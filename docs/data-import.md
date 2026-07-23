# Data Import Contract

No real public dataset is bundled in this repository.

Future import jobs should provide explicit source metadata before creating domain records.

## Source JSON

```json
{
  "organization": "DEMO organization",
  "title": "DEMO source title",
  "url": "https://example.com/source",
  "publishedAt": null,
  "accessedAt": "2026-07-23T00:00:00.000Z",
  "license": null,
  "externalId": "demo-source-id"
}
```

## Occupation JSON

```json
{
  "categorySlug": "demo-category",
  "name": "DEMO occupation",
  "slug": "demo-occupation",
  "summary": "DEMO data only",
  "description": "DEMO data only",
  "skills": [{ "slug": "demo-skill", "sourceExternalId": "demo-source-id" }],
  "qualifications": [],
  "majors": [],
  "competencies": []
}
```

Seed data must be marked `DEMO` or `TEST` and must not run automatically in production.

## Running the importer

```bash
npm run seed:occupations -- <path-to-json>
```

`scripts/seed-occupations.js` reads a JSON file matching the shape in
`data/occupations.template.json` (top-level `sources`, `categories`, `skills`,
`qualifications`, `majors`, `occupations` arrays) and upserts them by slug
(`externalId` for sources) so re-running the same file is safe. Every
`Occupation`/`Skill`/`Qualification`/`Major` link and every `Competency` must
reference a `sourceExternalId` declared in `sources` — the script refuses to
run without one, so citations always resolve.

This is a manual CLI script, not wired into `prisma migrate` or `prisma db
seed`, so it never runs automatically. Fill the template with real data from
an authoritative source (NCS, 워크넷, 커리어넷, etc.) — do not invent
occupations, skills, or citations.
