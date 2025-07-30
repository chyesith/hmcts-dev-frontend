import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-task-dialog',
  standalone: false,
  templateUrl: './add-task-dialog.html',
  styleUrl: './add-task-dialog.scss',
})
export class AddTaskDialog {
  dataForm: FormGroup;
  minDate = new Date();
  private _snackBar = inject(MatSnackBar);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],
      dueDate: ['', Validators.required],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.dataForm.valid) {
      this.dialogRef.close(this.dataForm.value);
    } else {
      this.dataForm.getError;
    }
  }

  openSnackBar() {
    this._snackBar.open('message', 'action');
    this.dialogRef.close();
  }
}
