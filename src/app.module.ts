import { ALIAS_CHECK } from '@/alias-check';
import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';

// Phase 0: touch alias import so @/* resolves at build time
void ALIAS_CHECK;

@Module({
  imports: [PrismaModule],
})
export class AppModule {}
