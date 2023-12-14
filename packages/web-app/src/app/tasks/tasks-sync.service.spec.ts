import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { StorageService } from '../storage/storage.service';
import { Task, TaskPriority, generateTask } from '@take-home/shared';
import { TasksSyncService } from './tasks-sync.service';

class MockStorageService {
  addTask(item: Task): Promise<void> {
    throw new Error('Method not implemented.');
  }
  updateTask(item: Task): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getTask(id: string | null): Promise<Task> {
    throw new Error('Method not implemented.');
  }
  getTasks(): Promise<Task[]> {
    throw new Error('Method not implemented.');
  }
}

describe('StorageService', () => {
  let service: TasksSyncService;
  let storageService: StorageService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TasksSyncService,
        { provide: StorageService, useClass: MockStorageService },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TasksSyncService);
    storageService = TestBed.inject(StorageService);
  });

  describe('syncFromApi', () => {
    it('should send a GET request to /tasks', async () => {
      jest
        .spyOn(storageService, 'updateTask')
        .mockImplementation(() => Promise.resolve());

      const res = service.syncFromApi();

      const endpointUrl = '/api/tasks';
      const req = httpTestingController.expectOne(endpointUrl);
      expect(req.request.method).toEqual('GET');
      req.flush([]);
      httpTestingController.verify();

      await res;
    });

    it('should return the received data', async () => {
      jest
        .spyOn(storageService, 'updateTask')
        .mockImplementation(() => Promise.resolve());

      const res = service.syncFromApi();

      const fakeData = [1, 2, 3];
      const endpointUrl = '/api/tasks';
      const req = httpTestingController.expectOne(endpointUrl);
      req.flush(fakeData);
      httpTestingController.verify();

      await res;

      expect(storageService.updateTask).toHaveBeenNthCalledWith(1, 1);
      expect(storageService.updateTask).toHaveBeenNthCalledWith(2, 2);
      expect(storageService.updateTask).toHaveBeenNthCalledWith(3, 3);
    });
  });
});
