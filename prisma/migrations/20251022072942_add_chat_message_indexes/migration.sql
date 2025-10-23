-- CreateIndex
CREATE INDEX "ChatMessage_senderId_createdAt_idx" ON "ChatMessage"("senderId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ChatMessage_receiverId_createdAt_idx" ON "ChatMessage"("receiverId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_receiverId_createdAt_idx" ON "ChatMessage"("senderId", "receiverId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ChatMessage_receiverId_senderId_createdAt_idx" ON "ChatMessage"("receiverId", "senderId", "createdAt" DESC);
