import { Component } from '@angular/core';

import { Task } from '@take-home/shared';
import { TasksPaginationService } from '../tasks-pagination.service';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';
import { TasksSyncService } from '../tasks-sync.service';

@Component({
  selector: 'take-home-list-component',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  constructor(
    private storageService: StorageService,
    protected tasksPaginationService: TasksPaginationService,
    private tasksSyncService: TasksSyncService,
    private router: Router,
  ) {
    this.tasksSyncService.syncFromApi();
  }

  onDoneTask(item: Task): void {
    item.completed = true;
    this.storageService.updateTask(item);
    this.tasksPaginationService.refresh();
  }

  onDeleteTask(item: Task): void {
    item.isArchived = true;
    this.storageService.updateTask(item);
    this.tasksPaginationService.refresh();
  }

  onAddTask(): void {
    this.router.navigate(['add']);
  }
}
