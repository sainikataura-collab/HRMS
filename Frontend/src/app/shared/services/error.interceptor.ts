import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar'; // For Snackbar notifications

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          // Connection refused or server unreachable
          this.snackBar.open('Server problem, please try again later', 'Close', {
            duration: 3000, // Display for 3 seconds
          });
        } else {
          // Handle other HTTP errors if needed
          this.snackBar.open(`Error: ${error.message}`, 'Close', {
            duration: 3000,
          });
        }
        return throwError(() => error);
      })
    );
  }
}
