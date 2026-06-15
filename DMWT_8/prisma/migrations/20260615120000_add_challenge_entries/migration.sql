CREATE TABLE "ChallengeEntry" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "screenMinutes" INTEGER NOT NULL,
    "targetMinutes" INTEGER NOT NULL,
    "goal" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChallengeEntry_userId_day_key" ON "ChallengeEntry"("userId", "day");
CREATE INDEX "ChallengeEntry_userId_idx" ON "ChallengeEntry"("userId");

ALTER TABLE "ChallengeEntry"
ADD CONSTRAINT "ChallengeEntry_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
