import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskPriority } from '@take-home/shared';
import { StorageService } from '../storage/storage.service';

@Injectable({ providedIn: 'root' })
export class TasksService {
  tasks: Task[] = [];

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}

  getTasksFromApi(): Observable<Task[]> {
    const endpointUrl = '/api/tasks';
    return this.http.get<Task[]>(endpointUrl);
  }

  async getTasksFromStorage(): Promise<void> {
    this.tasks = await this.storageService.getTasks();
    this.filterTask('isArchived');
  }

  filterTask(key: keyof Task): void {
    switch (key) {
      case 'isArchived':
        this.tasks = this.tasks.filter((task) => !task.isArchived);
        break;
      case 'priority':
        this.tasks = this.tasks.filter(
          (task) => task.priority === TaskPriority.HIGH,
        );
        break;
      case 'scheduledDate':
        const today = new Date();
        this.tasks = this.tasks.filter((task) => {
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
        break;
      case 'completed':
        this.tasks = this.tasks.filter((task) => !task.completed);
    }
  }

  searchTask(search: string): void {
    if (search) {
      const searchLower = search.toLocaleLowerCase();
      this.tasks = this.tasks.filter((task) =>
        task.title.toLocaleLowerCase().includes(searchLower),
      );
    } else {
      this.getTasksFromStorage();
    }
  }
}
