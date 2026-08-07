-- CreateIndex
CREATE INDEX "XpTransaction_userId_idx" ON "XpTransaction"("userId");

-- CreateIndex
CREATE INDEX "XpTransaction_createdAt_idx" ON "XpTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "XpTransaction_userId_createdAt_idx" ON "XpTransaction"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyLeaderboardSnapshot_weekStart_userId_key" ON "WeeklyLeaderboardSnapshot"("weekStart", "userId");
