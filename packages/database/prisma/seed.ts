
// packages/database/prisma/seed.ts
import { PrismaClient } from '../src/generated';
import { MigrationService } from '../src/migrations/migration.service';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    const migrationService = new MigrationService(prisma);
    await migrationService.seedDatabase();

    console.log('✅ Database seeding completed');
}

main()
    .catch((e) => {
        console.error('❌ Database seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });