import { Injectable } from '@angular/core';
import { take } from 'rxjs';

import { Task } from '@take-home/shared';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class TasksSyncService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}

  async syncFromApi(): Promise<void> {
    const endpointUrl = '/api/tasks';
    return new Promise((resolve) =>
      this.http
        .get<Task[]>(endpointUrl)
        .pipe(take(1))
        .subscribe((tasks) => {
          Promise.all(
            tasks.map((task) => this.storageService.updateTask(task)),
          ).then(() => resolve());
        }),
    );
  }
}
