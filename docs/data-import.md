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
