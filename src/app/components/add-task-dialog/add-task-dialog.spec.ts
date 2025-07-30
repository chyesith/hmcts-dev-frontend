import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTaskDialog } from './add-task-dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('AddTaskDialog', () => {
  let component: AddTaskDialog;
  let fixture: ComponentFixture<AddTaskDialog>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<AddTaskDialog>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [AddTaskDialog],
      imports: [ReactiveFormsModule, MatSnackBarModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTaskDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create dialog component', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should submit form when valid', () => {
    component.dataForm.setValue({
      title: 'Task Title',
      description: 'Some description',
      status: 'In Progress',
      dueDate: new Date(),
    });
    component.onSubmit();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(component.dataForm.value);
  });
});
