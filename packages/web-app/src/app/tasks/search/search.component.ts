import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TasksPaginationService } from '../tasks-pagination.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'take-home-search-component',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  protected searchForm: FormGroup = new FormGroup({
    search: new FormControl(null),
  });

  constructor(private taskService: TasksPaginationService) {
    this.searchForm.controls['search'].valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.taskService.setSearch(searchValue);
      });
  }
}
