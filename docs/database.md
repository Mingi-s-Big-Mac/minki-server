# Database

The database is PostgreSQL managed by Prisma.

Core model groups:

- User and auth: `User`, `School`, `EmailVerification`, `RefreshToken`.
- Exploration catalog: `OccupationCategory`, `Occupation`, `Skill`, `Qualification`, `Major`, `Competency`.
- Many-to-many links: `OccupationSkill`, `OccupationQualification`, `OccupationMajor`.
- Sources: `Source`, `SourceDocument`, `SourceChunk`.
- User activity: `InterestOccupation`, `RecentSearch`, `UserActivity`.
- Roadmaps: `Roadmap`, `RoadmapSemester`, `RoadmapItem`.
- AI conversations: `Conversation`, `Message`, `Citation`.

Important rules:

- Passwords, email codes, and tokens are stored only as hashes.
- Users are soft deleted through `User.status` and `User.deletedAt`.
- User-owned records must be queried with `userId` ownership filters.
- pgvector is enabled for future `SourceChunk.embedding` use.
- Official-looking source data must not be invented.
