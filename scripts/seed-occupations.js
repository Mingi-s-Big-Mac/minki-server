import { readFile } from 'node:fs/promises';

import { getPrismaClient, disconnectDatabase } from '../src/config/prisma.js';

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

async function upsertSource(prisma, source) {
  if (!source.externalId) {
    throw new Error(`Source "${source.title}" is missing externalId`);
  }

  const existing = await prisma.source.findFirst({ where: { externalId: source.externalId } });
  const data = {
    organization: source.organization,
    title: source.title,
    url: source.url,
    publishedAt: source.publishedAt ? new Date(source.publishedAt) : null,
    accessedAt: new Date(source.accessedAt),
    license: source.license ?? null,
    externalId: source.externalId,
  };

  if (existing) {
    return prisma.source.update({ where: { id: existing.id }, data });
  }
  return prisma.source.create({ data });
}

function sourceIdOf(sourceMap, externalId) {
  if (!externalId) return null;
  const id = sourceMap.get(externalId);
  if (!id) {
    throw new Error(`Unknown sourceExternalId "${externalId}" — declare it under "sources" first`);
  }
  return id;
}

async function seed(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  const data = JSON.parse(raw);
  const prisma = getPrismaClient();

  const sourceMap = new Map();
  for (const source of data.sources ?? []) {
    const record = await upsertSource(prisma, source);
    sourceMap.set(source.externalId, record.id);
  }

  const categoryMap = new Map();
  for (const category of data.categories ?? []) {
    const record = await prisma.occupationCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, displayOrder: category.displayOrder ?? 0 },
      create: {
        slug: category.slug,
        name: category.name,
        displayOrder: category.displayOrder ?? 0,
      },
    });
    categoryMap.set(category.slug, record.id);
  }

  const skillMap = new Map();
  for (const skill of data.skills ?? []) {
    const record = await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: { name: skill.name, description: skill.description ?? null },
      create: { slug: skill.slug, name: skill.name, description: skill.description ?? null },
    });
    skillMap.set(skill.slug, record.id);
  }

  const qualificationMap = new Map();
  for (const qualification of data.qualifications ?? []) {
    const record = await prisma.qualification.upsert({
      where: { slug: qualification.slug },
      update: {
        name: qualification.name,
        description: qualification.description ?? null,
        issuingOrganization: qualification.issuingOrganization ?? null,
      },
      create: {
        slug: qualification.slug,
        name: qualification.name,
        description: qualification.description ?? null,
        issuingOrganization: qualification.issuingOrganization ?? null,
      },
    });
    qualificationMap.set(qualification.slug, record.id);
  }

  const majorMap = new Map();
  for (const major of data.majors ?? []) {
    const record = await prisma.major.upsert({
      where: { slug: major.slug },
      update: { name: major.name, description: major.description ?? null },
      create: { slug: major.slug, name: major.name, description: major.description ?? null },
    });
    majorMap.set(major.slug, record.id);
  }

  for (const occupation of data.occupations ?? []) {
    const categoryId = categoryMap.get(occupation.categorySlug);
    if (!categoryId) {
      throw new Error(
        `Occupation "${occupation.slug}" references unknown categorySlug "${occupation.categorySlug}"`,
      );
    }

    const occupationRecord = await prisma.occupation.upsert({
      where: { slug: occupation.slug },
      update: {
        categoryId,
        name: occupation.name,
        summary: occupation.summary,
        description: occupation.description,
        outlook: occupation.outlook ?? null,
      },
      create: {
        categoryId,
        name: occupation.name,
        slug: occupation.slug,
        summary: occupation.summary,
        description: occupation.description,
        outlook: occupation.outlook ?? null,
      },
    });

    for (const [index, skillLink] of (occupation.skills ?? []).entries()) {
      const skillId = skillMap.get(skillLink.slug);
      if (!skillId)
        throw new Error(
          `Occupation "${occupation.slug}" references unknown skill slug "${skillLink.slug}"`,
        );

      await prisma.occupationSkill.upsert({
        where: { occupationId_skillId: { occupationId: occupationRecord.id, skillId } },
        update: {
          importance: skillLink.importance ?? null,
          displayOrder: skillLink.displayOrder ?? index,
          description: skillLink.description ?? null,
          sourceId: sourceIdOf(sourceMap, skillLink.sourceExternalId),
        },
        create: {
          occupationId: occupationRecord.id,
          skillId,
          importance: skillLink.importance ?? null,
          displayOrder: skillLink.displayOrder ?? index,
          description: skillLink.description ?? null,
          sourceId: sourceIdOf(sourceMap, skillLink.sourceExternalId),
        },
      });
    }

    for (const [index, qualificationLink] of (occupation.qualifications ?? []).entries()) {
      const qualificationId = qualificationMap.get(qualificationLink.slug);
      if (!qualificationId) {
        throw new Error(
          `Occupation "${occupation.slug}" references unknown qualification slug "${qualificationLink.slug}"`,
        );
      }

      await prisma.occupationQualification.upsert({
        where: {
          occupationId_qualificationId: { occupationId: occupationRecord.id, qualificationId },
        },
        update: {
          importance: qualificationLink.importance ?? null,
          displayOrder: qualificationLink.displayOrder ?? index,
          description: qualificationLink.description ?? null,
          sourceId: sourceIdOf(sourceMap, qualificationLink.sourceExternalId),
        },
        create: {
          occupationId: occupationRecord.id,
          qualificationId,
          importance: qualificationLink.importance ?? null,
          displayOrder: qualificationLink.displayOrder ?? index,
          description: qualificationLink.description ?? null,
          sourceId: sourceIdOf(sourceMap, qualificationLink.sourceExternalId),
        },
      });
    }

    for (const [index, majorLink] of (occupation.majors ?? []).entries()) {
      const majorId = majorMap.get(majorLink.slug);
      if (!majorId)
        throw new Error(
          `Occupation "${occupation.slug}" references unknown major slug "${majorLink.slug}"`,
        );

      await prisma.occupationMajor.upsert({
        where: { occupationId_majorId: { occupationId: occupationRecord.id, majorId } },
        update: {
          importance: majorLink.importance ?? null,
          displayOrder: majorLink.displayOrder ?? index,
          description: majorLink.description ?? null,
          sourceId: sourceIdOf(sourceMap, majorLink.sourceExternalId),
        },
        create: {
          occupationId: occupationRecord.id,
          majorId,
          importance: majorLink.importance ?? null,
          displayOrder: majorLink.displayOrder ?? index,
          description: majorLink.description ?? null,
          sourceId: sourceIdOf(sourceMap, majorLink.sourceExternalId),
        },
      });
    }

    for (const [index, competency] of (occupation.competencies ?? []).entries()) {
      const sourceId = sourceIdOf(sourceMap, competency.sourceExternalId);
      if (!sourceId) {
        throw new Error(
          `Competency "${competency.name}" on "${occupation.slug}" requires a sourceExternalId`,
        );
      }

      const existing = await prisma.competency.findFirst({
        where: { occupationId: occupationRecord.id, name: competency.name },
      });
      const competencyData = {
        occupationId: occupationRecord.id,
        name: competency.name,
        description: competency.description,
        score: competency.score ?? null,
        displayOrder: competency.displayOrder ?? index,
        sourceId,
      };

      if (existing) {
        await prisma.competency.update({ where: { id: existing.id }, data: competencyData });
      } else {
        await prisma.competency.create({ data: competencyData });
      }
    }

    process.stdout.write(`upserted occupation: ${occupation.slug}\n`);
  }
}

const filePath = process.argv[2];
if (!filePath) {
  fail('Usage: node scripts/seed-occupations.js <path-to-json>');
  process.exit(1);
}

try {
  await seed(filePath);
} catch (error) {
  fail(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
