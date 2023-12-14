import { Component } from '@angular/core';

import { Task } from '@take-home/shared';
import { TasksPaginationService } from '../tasks-pagination.service';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';
import { TasksSyncService } from '../tasks-sync.service';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'take-home-list-component',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [
    trigger('filterAnimation', [
      transition(':enter, * => 0, * => -1', []),
      transition(':increment', [
        query(
          ':enter',
          [
            style({ opacity: 0, height: 0 }),
            stagger(150, [
              animate('300ms ease-out', style({ opacity: 1, height: '*' })),
            ]),
          ],
          { optional: true },
        ),
      ]),
      transition(':decrement', [
        query(':leave', [
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 0, height: 0 })),
          ]),
        ]),
      ]),
    ]),
  ],
})
export class ListComponent {
  constructor(
    private storageService: StorageService,
    protected tasksPaginationService: TasksPaginationService,
    private tasksSyncService: TasksSyncService,
    private router: Router,
  ) {
    this.tasksSyncService
      .syncFromApi()
      .then(() => this.tasksPaginationService.refresh());
  }

  async onDoneTask(item: Task) {
    item.completed = true;
    await this.storageService.updateTask(item);
    this.tasksPaginationService.refresh();
  }

  async onDeleteTask(item: Task) {
    item.isArchived = true;
    await this.storageService.updateTask(item);
    this.tasksPaginationService.refresh();
  }

  onAddTask(): void {
    this.router.navigate(['add']);
  }

  taskTrackBy(index: number, task: Task) {
    return task.uuid;
  }
}
