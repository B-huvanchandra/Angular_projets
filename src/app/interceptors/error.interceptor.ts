
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  console.log('HTTP Request:', req.method, req.url);

  return next(req).pipe(

    catchError((error) => {

      console.error('HTTP Error:', error);

      let errorMessage = 'Something went wrong. Please try again.';

      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server.';
      } else if (error.status === 400) {
        errorMessage = 'Bad request. Please check your input.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'Requested resource was not found.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      console.error(errorMessage);

      return throwError(() => error);
    })

  );
};
