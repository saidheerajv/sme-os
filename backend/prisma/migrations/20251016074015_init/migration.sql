-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicEntity" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicEntity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EntityDefinition_name_key" ON "EntityDefinition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EntityDefinition_tableName_key" ON "EntityDefinition"("tableName");

-- CreateIndex
CREATE INDEX "EntityDefinition_userId_idx" ON "EntityDefinition"("userId");

-- CreateIndex
CREATE INDEX "DynamicEntity_entityType_userId_idx" ON "DynamicEntity"("entityType", "userId");

-- CreateIndex
CREATE INDEX "DynamicEntity_userId_idx" ON "DynamicEntity"("userId");

-- AddForeignKey
ALTER TABLE "EntityDefinition" ADD CONSTRAINT "EntityDefinition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicEntity" ADD CONSTRAINT "DynamicEntity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
