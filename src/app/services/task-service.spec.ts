import { TestBed } from '@angular/core/testing';
import { TaskService } from './task-service';
import { Task } from '../models/task';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        provideHttpClientTesting(), // new Angular 20 way
      ],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch tasks', () => {
    const mockTasks: Task[] = [
      {
        id: 1,
        title: 'Task 1',
        description: 'Desc',
        status: 'IN_PROGRESS',
        dueDate: '2025-12-29T23:59:59',
      },
    ];

    service.getTasks().subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne(service['apiUrl']);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should create task', () => {
    const newTask: Task = {
      id: 2,
      title: 'Task 2',
      description: 'Desc',
      status: 'IN_PROGRESS',
      dueDate: '2025-12-30T23:59:59',
    };

    service.createTask(newTask).subscribe((task) => {
      expect(task).toEqual(newTask);
    });

    const req = httpMock.expectOne(service['apiUrl']);
    expect(req.request.method).toBe('POST');
    req.flush(newTask);
  });

  it('should update task status', () => {
    const taskId = 1;
    const status = 'COMPLETED';

    service.updateTaskStatusById(taskId, status).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(
      `${service['apiUrl']}/${taskId}/status?status=${status}`
    );
    expect(req.request.method).toBe('PATCH');
    req.flush({ success: true });
  });

  it('should delete task', () => {
    const taskId = 1;

    service.deleteTask(taskId).subscribe((res) => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/${taskId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
