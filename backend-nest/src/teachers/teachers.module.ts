import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Teacher, TeacherSchema } from './schemas/teacher.schema';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

@Module({
  // Registers the "Teacher" model so it can be injected inside this module
  imports: [MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }])],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}