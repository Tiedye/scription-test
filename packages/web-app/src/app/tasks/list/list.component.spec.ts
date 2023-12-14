import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { Task, generateTask } from '@take-home/shared';
import { Observable, of } from 'rxjs';
import { ListComponent } from './list.component';
import { TasksPaginationService } from '../tasks-pagination.service';
import { MatCardModule } from '@angular/material/card';
import { FiltersComponent } from '../filters/filters.component';
import { SearchComponent } from '../search/search.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../storage/storage.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { routes } from '../../app.module';
import { TasksSyncService } from '../tasks-sync.service';

const fakeTasks: Task[] = [
  generateTask({ uuid: '3', completed: false }),
  generateTask({ uuid: '4', completed: false }),
];

class InMemStorageService {
  private items = new Map<string, Task>(fakeTasks.map((t) => [t.uuid, t]));

  get tasks(): Task[] {
    return Array.from(this.items.values());
  }

  async addTask(item: Task) {
    this.items.set(item.uuid, item);
  }

  async updateTask(item: Task) {
    this.items.set(item.uuid, item);
  }

  async getTask(id: string | null): Promise<Task | undefined> {
    if (!id) return undefined;
    return this.items.get(id);
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.items.values());
  }
}

class MockTasksSyncService {
  async syncFromApi(): Promise<void> {}
}

describe('ListComponent', () => {
  let fixture: ComponentFixture<ListComponent>;
  let loader: HarnessLoader;
  let component: ListComponent;
  let tasksService: TasksPaginationService;
  let storageService: InMemStorageService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatChipsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
      ],
      declarations: [ListComponent, FiltersComponent, SearchComponent],
      providers: [
        TasksPaginationService,
        { provide: StorageService, useClass: InMemStorageService },
        { provide: TasksSyncService, useClass: MockTasksSyncService },
      ],
    }).compileComponents();
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
    });
    router = TestBed.inject(Router);
    tasksService = TestBed.inject(TasksPaginationService);
    storageService = TestBed.inject(
      StorageService,
    ) as unknown as InMemStorageService;
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    router.initialNavigation();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should display the title', () => {
    const title = fixture.debugElement.query(By.css('header'));
    expect(title.nativeElement.textContent).toEqual('My Daily Tasks');
  });

  it(`should display total number of tasks`, async () => {
    fixture.detectChanges();
    const total = fixture.debugElement.query(By.css('.results-info'));
    expect(total.nativeElement.textContent.trim()).toEqual(
      `${fakeTasks.length} results`,
    );
  });

  it(`should display list of tasks as mat-cards`, () => {
    fixture.detectChanges();
    const taskLists = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(taskLists.length).toEqual(fakeTasks.length);
  });

  it(`should navigate to /add when add button is clicked`, async () => {
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' }),
    );
    await addButton.click();
    fixture.detectChanges();
    expect(router.url).toEqual('/add');
  });

  it(`should mark a task as complete when done button is clicked`, async () => {
    expect(storageService.tasks[0].completed).toBe(false);
    jest.spyOn(component, 'onDoneTask');
    const doneButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="complete-task"]' }),
    );
    await doneButton.click();
    doneButton.click();
    fixture.detectChanges();
    expect(component.onDoneTask).toHaveBeenCalledTimes(1);
    expect(storageService.tasks[0].completed).toBe(true);
  });

  it(`should mark a task as archived when delete button is clicked`, async () => {
    expect(storageService.tasks[0].isArchived).toBe(false);
    jest.spyOn(component, 'onDeleteTask');
    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="delete-task"]' }),
    );
    await deleteButton.click();
    expect(component.onDeleteTask).toHaveBeenCalledTimes(1);
    expect(storageService.tasks[0].isArchived).toBe(true);
  });

  it(`should not display archived tasks after deleting them`, async () => {
    storageService.tasks[0].isArchived = false;
    storageService.tasks[1].isArchived = false;
    fixture.detectChanges();
    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="delete-task"]' }),
    );
    await deleteButton.click();

    const taskLists = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(taskLists.length).toEqual(fakeTasks.length - 1);
  });
});
