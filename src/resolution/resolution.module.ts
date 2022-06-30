import { Module } from '@nestjs/common';
import { ResolutionService } from './resolution.service';
import { ResolutionController } from './resolution.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resolution } from './entities/resolution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resolution])],
  controllers: [ResolutionController],
  providers: [ResolutionService],
})
export class ResolutionModule {}
