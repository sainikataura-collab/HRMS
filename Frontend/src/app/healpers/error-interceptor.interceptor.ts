import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';

export const errorInterceptorInterceptor: HttpInterceptorFn = (req:any, next:HttpHandlerFn): Observable<HttpEvent<any>> => {

return next(req);
};