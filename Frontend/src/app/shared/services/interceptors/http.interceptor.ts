import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar); // Inject MatSnackBar service

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 0) {
        // Handle server connection errors
        snackBar.open('Server problem, please try again later', 'Close', {
          duration: 3000, // Display for 3 seconds
          
        });
      } else {
        // Handle other HTTP errors if needed
        snackBar.open(`Error: ${error.message}`, 'Close', {
          duration: 3000,
        });
      }
      return throwError(() => error);
    })
  );
};
