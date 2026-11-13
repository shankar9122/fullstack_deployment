import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { ListTeachersQueryDto } from './dto/list-teachers-query.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  async findAll(@Query() query: ListTeachersQueryDto) {
    const { items, pagination } = await this.teachersService.findAll(query);
    return { teachers: items, pagination };
  }

  // Nest answers POST with 201 by default
  @Post()
  async create(@Body() dto: CreateTeacherDto) {
    return { teacher: await this.teachersService.create(dto) };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return { teacher: await this.teachersService.findOne(id) };
  }

  @Patch(':id')
  async update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateTeacherDto) {
    return { teacher: await this.teachersService.update(id, dto) };
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    const teacher = await this.teachersService.remove(id);
    return { message: 'Teacher deleted successfully', teacher };
  }
}