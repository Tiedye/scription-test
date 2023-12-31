import { TasksPaginationService } from './tasks-pagination.service';
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { StorageService } from '../storage/storage.service';
import { Task, TaskPriority, generateTask } from '@take-home/shared';

class MockStorageService {
  tasks: Task[] = [];
  getTasks(): Promise<Task[]> {
    return Promise.resolve(this.tasks);
  }
}

describe('TasksService', () => {
  let service: TasksPaginationService;
  let storageService: MockStorageService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    storageService = new MockStorageService();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TasksPaginationService,
        { provide: StorageService, useValue: storageService },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TasksPaginationService);
  });

  describe('refresh', () => {
    it('should load tasks from storage', async () => {
      jest.spyOn(storageService, 'getTasks').mockResolvedValueOnce([]);
      await service.refresh();
      expect(service.tasks).toEqual([]);
      expect(storageService.getTasks).toHaveBeenCalledTimes(1);
    });

    it('should filter tasks by isArchived', async () => {
      jest
        .spyOn(storageService, 'getTasks')
        .mockResolvedValueOnce([
          generateTask({ isArchived: true }),
          generateTask({}),
        ]);
      await service.refresh();
      expect(service.tasks.length).toEqual(1);
    });
  });

  describe('setFilter', () => {
    it('should filter task by priority key', async () => {
      storageService.tasks = [
        generateTask({ priority: TaskPriority.LOW }),
        generateTask({ priority: TaskPriority.HIGH }),
      ];
      await service.refresh();
      service.setFilter('priority', true);
      expect(service.tasks.length).toEqual(1);
    });

    it('should filter task by completed key', async () => {
      storageService.tasks = [
        generateTask({ completed: false }),
        generateTask({ completed: true }),
      ];
      await service.refresh();
      service.setFilter('completed', true);
      expect(service.tasks.length).toEqual(1);
    });

    it('should filter task by scheduledDate key', async () => {
      const today = new Date();
      storageService.tasks = [
        generateTask({ scheduledDate: today }),
        generateTask({
          scheduledDate: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1,
          ),
        }),
        generateTask({
          scheduledDate: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 1,
          ),
        }),
      ];
      await service.refresh();
      service.setFilter('scheduledDate', true);
      expect(service.tasks.length).toEqual(1);
    });
  });

  describe('setSearch', () => {
    it('should search task list for title with search term', async () => {
      storageService.tasks = [
        generateTask({ title: 'Take home assignment' }),
        generateTask({ title: 'Thank you for your time' }),
      ];
      await service.refresh();
      service.setSearch('home');
      expect(service.tasks.length).toEqual(1);
    });

    it('should reset task list if search term is empty', async () => {
      storageService.tasks = [
        generateTask({ title: 'Take home assignment' }),
        generateTask({ title: 'Thank you for your time' }),
      ];
      await service.refresh();
      service.setSearch('');
      expect(service.tasks.length).toEqual(2);
    });

    it('should search task list for a fuzzy match on title', async () => {
      storageService.tasks = [
        generateTask({ title: 'Take home assignment' }),
        generateTask({ title: 'Thank you for your time' }),
      ];
      await service.refresh();
      service.setSearch('hoem');
      expect(service.tasks.length).toEqual(1);
    });
  });
});
