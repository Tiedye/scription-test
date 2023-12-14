import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskPriority } from '@take-home/shared';
import { StorageService } from '../storage/storage.service';
import Fuse from 'fuse.js';

@Injectable({ providedIn: 'root' })
export class TasksPaginationService {
  private allTasks: Task[] = [];
  private taskCache: Task[] = [];
  private cacheStale = true;
  private filter: keyof Task | undefined;
  private search = '';

  constructor(private storageService: StorageService) {}

  setFilter(key: keyof Task, value: boolean): void {
    if (value) {
      this.filter = key;
    } else {
      this.filter = undefined;
    }
    this.cacheStale = true;
  }

  getFilter(key: keyof Task): boolean {
    return this.filter === key;
  }

  setSearch(search: string): void {
    this.search = search;
    this.cacheStale = true;
  }

  async refresh() {
    this.allTasks = await this.storageService.getTasks();
    this.cacheStale = true;
  }

  private filterTasks(tasks: Task[], keys: (keyof Task | undefined)[]): Task[] {
    return keys.reduce((tasks, key) => {
      switch (key) {
        case 'isArchived':
          return tasks.filter((task) => !task.isArchived);
        case 'priority':
          return tasks.filter((task) => task.priority === TaskPriority.HIGH);
        case 'scheduledDate':
          const today = new Date();
          return tasks.filter((task) => {
            const scheduledDate =
              task.scheduledDate instanceof Date
                ? task.scheduledDate
                : new Date(task.scheduledDate);
            return (
              today.getFullYear() === scheduledDate.getFullYear() &&
              today.getMonth() === scheduledDate.getMonth() &&
              today.getDate() === scheduledDate.getDate()
            );
          });
        case 'completed':
          return tasks.filter((task) => !task.completed);
        default:
          return tasks;
      }
    }, tasks);
  }

  private searchTasks(tasks: Task[], search: string): Task[] {
    if (search) {
      const fuse = new Fuse(tasks, { keys: ['title', 'description'] });
      return fuse.search(search).map((r) => r.item);
    }
    return tasks;
  }

  get tasks(): Task[] {
    if (this.cacheStale) {
      this.taskCache = this.searchTasks(
        this.filterTasks(this.allTasks, ['isArchived', this.filter]),
        this.search,
      );
      this.cacheStale = false;
    }
    return this.taskCache;
  }
}
