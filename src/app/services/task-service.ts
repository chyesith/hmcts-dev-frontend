import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Task } from '../models/task';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `http://localhost:4000/api/v1/tasks`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  createTask(task: Task): Observable<Task> {
    return this.http
      .post<Task>(this.apiUrl, task, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Create task failed', error);
          return throwError(() => error);
        })
      );
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  updateTaskStatusById(taskId: number, status: string): Observable<any> {
    const url = `${this.apiUrl}/${taskId}/status?status=${status}`;
    return this.http.patch(url, {}, { headers: this.getAuthHeaders() });
  }

  deleteTask(taskId: number): Observable<void> {
    const url = `${this.apiUrl}/${taskId}`;
    return this.http.delete<void>(url, { headers: this.getAuthHeaders() });
  }
}
