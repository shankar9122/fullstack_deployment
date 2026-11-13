import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { escapeRegex } from '../common/utils/escape-regex';
import { buildPagination, resolvePagination, type Paginated } from '../common/utils/pagination';
import { withoutUndefined } from '../common/utils/without-undefined';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { ListTeachersQueryDto } from './dto/list-teachers-query.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher, TeacherDocument } from './schemas/teacher.schema';

@Injectable()
export class TeachersService {
  // @InjectModel gives us the Mongoose model that forFeature() registered in TeachersModule
  constructor(@InjectModel(Teacher.name) private readonly teacherModel: Model<Teacher>) {}

  async create(dto: CreateTeacherDto): Promise<TeacherDocument> {
    return this.teacherModel.create({ ...dto });
  }

  async findAll(query: ListTeachersQueryDto): Promise<Paginated<TeacherDocument>> {
    const { page, limit, skip } = resolvePagination(query);

    const pattern = query.search ? { $regex: escapeRegex(query.search), $options: 'i' } : null;
    const filter = pattern ? { $or: [{ name: pattern }, { subject: pattern }] } : {};

    // The two queries do not depend on each other, so they run together.
    // _id is the final sort key so that pages never repeat or skip rows
    const [items, total] = await Promise.all([
      this.teacherModel.find(filter).sort({ name: 1, _id: 1 }).skip(skip).limit(limit),
      this.teacherModel.countDocuments(filter),
    ]);

    return { items, pagination: buildPagination(page, limit, total) };
  }

  async findOne(id: string): Promise<TeacherDocument> {
    const teacher = await this.teacherModel.findById(id);
    if (!teacher) throw new NotFoundException('Teacher not found');

    return teacher;
  }

  async update(id: string, dto: UpdateTeacherDto): Promise<TeacherDocument> {
    const updates = withoutUndefined(dto);

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    // runValidators: updates skip the schema rules unless this is on
    const teacher = await this.teacherModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!teacher) throw new NotFoundException('Teacher not found');

    return teacher;
  }

  async remove(id: string): Promise<TeacherDocument> {
    // TODO (6.4): refuse to delete a teacher who is the class teacher of any class
    const teacher = await this.teacherModel.findByIdAndDelete(id);
    if (!teacher) throw new NotFoundException('Teacher not found');

    return teacher;
  }
}