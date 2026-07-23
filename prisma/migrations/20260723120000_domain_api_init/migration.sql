CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DELETED', 'SUSPENDED');
CREATE TYPE "EmailVerificationPurpose" AS ENUM ('SIGN_UP', 'PASSWORD_RESET');
CREATE TYPE "RoadmapStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED');
CREATE TYPE "RoadmapItemType" AS ENUM ('TASK', 'SKILL', 'QUALIFICATION', 'COURSE', 'EXPERIENCE');
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');
CREATE TYPE "MessageStatus" AS ENUM ('SAVED', 'COMPLETED', 'FAILED');

CREATE TABLE "School" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "emailDomain" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Major" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Major_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "nickname" TEXT NOT NULL,
  "grade" INTEGER NOT NULL,
  "majorText" TEXT NOT NULL,
  "majorId" UUID,
  "schoolId" UUID,
  "emailVerifiedAt" TIMESTAMP(3),
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailVerification" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "purpose" "EmailVerificationPurpose" NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefreshToken" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "replacedByTokenId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OccupationCategory" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "OccupationCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Occupation" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "categoryId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "outlook" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Occupation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Skill" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Qualification" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "issuingOrganization" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Source" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organization" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "accessedAt" TIMESTAMP(3) NOT NULL,
  "license" TEXT,
  "externalId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OccupationSkill" (
  "occupationId" UUID NOT NULL,
  "skillId" UUID NOT NULL,
  "importance" INTEGER,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "description" TEXT,
  "sourceId" UUID,
  CONSTRAINT "OccupationSkill_pkey" PRIMARY KEY ("occupationId", "skillId")
);

CREATE TABLE "OccupationQualification" (
  "occupationId" UUID NOT NULL,
  "qualificationId" UUID NOT NULL,
  "importance" INTEGER,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "description" TEXT,
  "sourceId" UUID,
  CONSTRAINT "OccupationQualification_pkey" PRIMARY KEY ("occupationId", "qualificationId")
);

CREATE TABLE "OccupationMajor" (
  "occupationId" UUID NOT NULL,
  "majorId" UUID NOT NULL,
  "importance" INTEGER,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "description" TEXT,
  "sourceId" UUID,
  CONSTRAINT "OccupationMajor_pkey" PRIMARY KEY ("occupationId", "majorId")
);

CREATE TABLE "Competency" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "occupationId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "score" INTEGER,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "sourceId" UUID NOT NULL,
  CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SourceDocument" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sourceId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "checksum" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SourceDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SourceChunk" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sourceDocumentId" UUID NOT NULL,
  "content" TEXT NOT NULL,
  "chunkIndex" INTEGER NOT NULL,
  "metadata" JSONB,
  "embedding" vector,
  CONSTRAINT "SourceChunk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterestOccupation" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "occupationId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterestOccupation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecentSearch" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "query" TEXT NOT NULL,
  "filters" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RecentSearch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserActivity" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "targetType" TEXT,
  "targetId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Roadmap" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "grade" INTEGER NOT NULL,
  "majorText" TEXT NOT NULL,
  "targetOccupationId" UUID NOT NULL,
  "inputSkills" JSONB,
  "status" "RoadmapStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoadmapSemester" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "roadmapId" UUID NOT NULL,
  "semesterOrder" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RoadmapSemester_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoadmapItem" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "roadmapSemesterId" UUID NOT NULL,
  "type" "RoadmapItemType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "relatedSkillId" UUID,
  "relatedQualificationId" UUID,
  "sourceId" UUID,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "RoadmapItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Conversation" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "title" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Message" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "conversationId" UUID NOT NULL,
  "role" "MessageRole" NOT NULL,
  "content" TEXT NOT NULL,
  "status" "MessageStatus" NOT NULL DEFAULT 'SAVED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Citation" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "messageId" UUID NOT NULL,
  "sourceId" UUID NOT NULL,
  "sourceChunkId" UUID,
  "citationNumber" INTEGER NOT NULL,
  "quotedText" TEXT,
  "relevanceScore" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "School_emailDomain_key" ON "School"("emailDomain");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE UNIQUE INDEX "OccupationCategory_slug_key" ON "OccupationCategory"("slug");
CREATE UNIQUE INDEX "Occupation_slug_key" ON "Occupation"("slug");
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");
CREATE UNIQUE INDEX "Qualification_slug_key" ON "Qualification"("slug");
CREATE UNIQUE INDEX "Major_slug_key" ON "Major"("slug");
CREATE UNIQUE INDEX "SourceChunk_sourceDocumentId_chunkIndex_key" ON "SourceChunk"("sourceDocumentId", "chunkIndex");
CREATE UNIQUE INDEX "InterestOccupation_userId_occupationId_key" ON "InterestOccupation"("userId", "occupationId");
CREATE UNIQUE INDEX "RoadmapSemester_roadmapId_semesterOrder_key" ON "RoadmapSemester"("roadmapId", "semesterOrder");
CREATE UNIQUE INDEX "Citation_messageId_citationNumber_key" ON "Citation"("messageId", "citationNumber");

CREATE INDEX "School_active_name_idx" ON "School"("active", "name");
CREATE INDEX "User_status_createdAt_idx" ON "User"("status", "createdAt");
CREATE INDEX "User_schoolId_idx" ON "User"("schoolId");
CREATE INDEX "User_majorId_idx" ON "User"("majorId");
CREATE INDEX "EmailVerification_email_purpose_createdAt_idx" ON "EmailVerification"("email", "purpose", "createdAt");
CREATE INDEX "RefreshToken_userId_createdAt_idx" ON "RefreshToken"("userId", "createdAt");
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
CREATE INDEX "OccupationCategory_active_displayOrder_idx" ON "OccupationCategory"("active", "displayOrder");
CREATE INDEX "Occupation_active_name_idx" ON "Occupation"("active", "name");
CREATE INDEX "Occupation_categoryId_active_idx" ON "Occupation"("categoryId", "active");
CREATE INDEX "Skill_active_name_idx" ON "Skill"("active", "name");
CREATE INDEX "Qualification_active_name_idx" ON "Qualification"("active", "name");
CREATE INDEX "Major_active_name_idx" ON "Major"("active", "name");
CREATE INDEX "OccupationSkill_skillId_idx" ON "OccupationSkill"("skillId");
CREATE INDEX "OccupationQualification_qualificationId_idx" ON "OccupationQualification"("qualificationId");
CREATE INDEX "OccupationMajor_majorId_idx" ON "OccupationMajor"("majorId");
CREATE INDEX "Competency_occupationId_displayOrder_idx" ON "Competency"("occupationId", "displayOrder");
CREATE INDEX "Source_organization_idx" ON "Source"("organization");
CREATE INDEX "Source_externalId_idx" ON "Source"("externalId");
CREATE INDEX "SourceDocument_sourceId_idx" ON "SourceDocument"("sourceId");
CREATE INDEX "InterestOccupation_userId_createdAt_idx" ON "InterestOccupation"("userId", "createdAt");
CREATE INDEX "RecentSearch_userId_createdAt_idx" ON "RecentSearch"("userId", "createdAt");
CREATE INDEX "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt");
CREATE INDEX "UserActivity_type_createdAt_idx" ON "UserActivity"("type", "createdAt");
CREATE INDEX "Roadmap_userId_createdAt_idx" ON "Roadmap"("userId", "createdAt");
CREATE INDEX "Roadmap_targetOccupationId_idx" ON "Roadmap"("targetOccupationId");
CREATE INDEX "RoadmapItem_roadmapSemesterId_displayOrder_idx" ON "RoadmapItem"("roadmapSemesterId", "displayOrder");
CREATE INDEX "Conversation_userId_updatedAt_idx" ON "Conversation"("userId", "updatedAt");
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

ALTER TABLE "User" ADD CONSTRAINT "User_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Major"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_replacedByTokenId_fkey" FOREIGN KEY ("replacedByTokenId") REFERENCES "RefreshToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Occupation" ADD CONSTRAINT "Occupation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "OccupationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OccupationSkill" ADD CONSTRAINT "OccupationSkill_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OccupationSkill" ADD CONSTRAINT "OccupationSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OccupationSkill" ADD CONSTRAINT "OccupationSkill_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OccupationQualification" ADD CONSTRAINT "OccupationQualification_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OccupationQualification" ADD CONSTRAINT "OccupationQualification_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES "Qualification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OccupationQualification" ADD CONSTRAINT "OccupationQualification_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OccupationMajor" ADD CONSTRAINT "OccupationMajor_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OccupationMajor" ADD CONSTRAINT "OccupationMajor_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Major"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OccupationMajor" ADD CONSTRAINT "OccupationMajor_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SourceDocument" ADD CONSTRAINT "SourceDocument_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SourceChunk" ADD CONSTRAINT "SourceChunk_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "SourceDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InterestOccupation" ADD CONSTRAINT "InterestOccupation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InterestOccupation" ADD CONSTRAINT "InterestOccupation_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "Occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecentSearch" ADD CONSTRAINT "RecentSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_targetOccupationId_fkey" FOREIGN KEY ("targetOccupationId") REFERENCES "Occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoadmapSemester" ADD CONSTRAINT "RoadmapSemester_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoadmapItem" ADD CONSTRAINT "RoadmapItem_roadmapSemesterId_fkey" FOREIGN KEY ("roadmapSemesterId") REFERENCES "RoadmapSemester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoadmapItem" ADD CONSTRAINT "RoadmapItem_relatedSkillId_fkey" FOREIGN KEY ("relatedSkillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RoadmapItem" ADD CONSTRAINT "RoadmapItem_relatedQualificationId_fkey" FOREIGN KEY ("relatedQualificationId") REFERENCES "Qualification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RoadmapItem" ADD CONSTRAINT "RoadmapItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_sourceChunkId_fkey" FOREIGN KEY ("sourceChunkId") REFERENCES "SourceChunk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
