-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" SERIAL NOT NULL,
    "dailyMinutes" INTEGER NOT NULL,
    "pickups" INTEGER NOT NULL,
    "mainApp" TEXT NOT NULL,
    "hardestMoment" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);
