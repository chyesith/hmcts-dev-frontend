import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TaskTableComponent } from './task-table.component';
import { TaskService } from '../../services/task-service';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Task } from '../../models/task';
import { By } from '@angular/platform-browser';

describe('TaskTableComponent', () => {
  let component: TaskTableComponent;
  let fixture: ComponentFixture<TaskTableComponent>;
  let taskService: TaskService;
  let httpMock: HttpTestingController;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      status: 'IN_PROGRESS',
      dueDate: '2025-12-29T23:59:59',
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      status: 'COMPLETED',
      dueDate: '2025-12-30T23:59:59',
    },
  ];

  beforeEach(() => {
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [TaskTableComponent],
      providers: [
        TaskTableComponent,
        TaskService,
        provideHttpClientTesting(),
        { provide: MatDialog, useValue: matDialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTableComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch tasks on init', fakeAsync(() => {
    spyOn(taskService, 'getTasks').and.returnValue(of(mockTasks));
    component.ngOnInit();
    tick();
    expect(component.rowData.length).toBe(2);
    expect(component.rowData).toEqual(mockTasks);
  }));

  it('should open AddTaskDialog and add task', fakeAsync(() => {
    const newTask: Task = {
      id: 3,
      title: 'Task 3',
      description: 'Desc 3',
      status: 'IN_PROGRESS',
      dueDate: '2025-12-31T23:59:59',
    };
    const matDialogRefSpy = {
      afterClosed: () => of(newTask),
    } as MatDialogRef<any>;

    dialogSpy.open.and.returnValue(matDialogRefSpy);

    spyOn(taskService, 'createTask').and.returnValue(of(newTask));

    component.openAddCaseDialog();
    tick();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(component.rowData.includes(newTask)).toBeTrue();
  }));

  it('should delete a row', fakeAsync(() => {
    component.rowData = [...mockTasks];
    component['gridApi'] = { applyTransaction: jasmine.createSpy() };

    spyOn(taskService, 'deleteTask').and.returnValue(of(void 0));

    component.onDeleteRow(mockTasks[0]);
    tick();

    expect(component.rowData.length).toBe(1);
    expect(component['gridApi'].applyTransaction).toHaveBeenCalledWith({
      remove: [mockTasks[0]],
    });
  }));

  it('should update status when onCellValueChanged is called', fakeAsync(() => {
    component.rowData = [...mockTasks];
    spyOn(taskService, 'updateTaskStatusById').and.returnValue(of({}));

    spyOn(component, 'refreshTasks');

    component.onCellValueChanged({
      colDef: { field: 'status' },
      data: { id: 1, status: 'COMPLETED' },
    });
    tick();

    expect(taskService.updateTaskStatusById).toHaveBeenCalledWith(
      1,
      'COMPLETED'
    );
    expect(component.refreshTasks).toHaveBeenCalled();
  }));
});
