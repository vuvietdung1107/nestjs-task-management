import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { User } from '../auth/user.entity';
import { GetUser } from '../auth/get-user.decorator';

@Injectable()
export class TasksService {
  constructor(private taskRepository: TaskRepository) {
  }

  async getTasks(
    filterDto: GetTaskFilterDto,
    user: User,
  ): Promise<Task[]> {
    return await this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(
    id: number,
    user: User,
  ): Promise<Task> {
    const found = await this.taskRepository.findOne({where: {id, userId: user.id} });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<Task> {
    return await this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTaskById(id: number, user: User): Promise<void> {
    const result = await this.taskRepository.delete({id, userId: user.id});

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();
    return task;
  }
}
