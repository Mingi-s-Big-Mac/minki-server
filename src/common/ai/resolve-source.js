export async function resolveAiSource(prisma, { externalId, organization, title }) {
  const existing = await prisma.source.findFirst({ where: { externalId } });
  if (existing) return existing;

  return prisma.source.create({
    data: {
      externalId,
      organization,
      title,
      url: `internal://ai-source/${encodeURIComponent(externalId)}`,
      accessedAt: new Date(),
    },
  });
}
