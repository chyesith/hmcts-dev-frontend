import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task-service';
import { Task } from '../../models/task';
import { GridApi, GridReadyEvent, type ColDef } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { AddTaskDialog } from '../add-task-dialog/add-task-dialog';

@Component({
  selector: 'app-task-table',
  standalone: false,
  templateUrl: './task-table.html',
  styleUrl: './task-table.scss',
})
export class TaskTableComponent implements OnInit {
  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title' },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      maxWidth: 500,
    },

    {
      field: 'status',
      headerName: 'Status',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['IN_PROGRESS', 'COMPLETED'], // must match backend data
      },
      valueFormatter: (params) => {
        switch (params.value) {
          case 'IN_PROGRESS':
            return 'In Progress';
          case 'COMPLETED':
            return 'Completed';
          default:
            return params.value;
        }
      },
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      cellRenderer: (params: { value: string }) =>
        this.formatDate(params.value),
      comparator: (date1, date2) =>
        new Date(date1).getTime() - new Date(date2).getTime(),
    },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: (params: any) => {
        const button = document.createElement('button');
        button.innerText = 'Delete';
        button.style.backgroundColor = '#dc3545';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '5px 10px';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';

        // When clicked, call your delete handler
        button.addEventListener('click', () => {
          if (
            confirm(`Are you sure you want to delete task ${params.data.id}?`)
          ) {
            params.context.componentParent.onDeleteRow(params.data);
          }
        });

        return button;
      },
    },
  ];

  rowData: Task[] = [];
  private gridApi: any;
  constructor(private dialog: MatDialog, private taskService: TaskService) {}

  ngOnInit(): void {
    this.refreshTasks();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  refreshTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.rowData = [...tasks];
        if (this.gridApi) {
          this.gridApi.setRowData(this.rowData);
        }
      },
      error: (err) => console.error('Failed to load tasks', err),
    });
  }

  createTask(): void {}

  defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    minWidth: 100,
  };

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  openAddCaseDialog(): void {
    const dialogRef = this.dialog.open(AddTaskDialog, {
      width: '600px',
      disableClose: true,
      panelClass: 'add-case-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.taskService.createTask(result).subscribe({
          next: (task) => {
            this.rowData.push(task);
          },
          error: (err) => console.error('Failed to create task', err),
        });
      }
    });
  }

  onCellValueChanged(event: any): void {
    if (event.colDef.field === 'status') {
      const taskId = event.data.id;
      const newStatus = event.data.status;

      this.taskService.updateTaskStatusById(taskId, newStatus).subscribe({
        next: () => this.refreshTasks(),
        error: (err) => {
          console.error(`Failed to update status for task ${taskId}`, err);
        },
      });
    }
  }

  onDeleteRow(task: any) {
    this.rowData = this.rowData.filter((t: any) => t.id !== task.id);
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.gridApi.applyTransaction({ remove: [task] });
      },

      error: (err) => {
        console.error('Delete failed', err);
      },
    });
  }
}
