-- Add email notification preferences to User table
ALTER TABLE "User" ADD COLUMN "emailOnForumPost" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "emailOnPostReply" BOOLEAN NOT NULL DEFAULT false;