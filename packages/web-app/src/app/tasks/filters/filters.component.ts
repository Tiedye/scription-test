import { Component } from '@angular/core';
import { TasksPaginationService } from '../tasks-pagination.service';

@Component({
  selector: 'take-home-filters-component',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent {
  constructor(protected tasksService: TasksPaginationService) {}
}
