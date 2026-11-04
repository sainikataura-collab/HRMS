import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { errorInterceptorInterceptor } from './healpers/error-interceptor.interceptor';
import { jwtTokenInterceptor } from './healpers/jwt-token.interceptor';
import { provideToastr, ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideNgxMask } from 'ngx-mask';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { httpInterceptor } from './shared/services/interceptors/http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes, withHashLocation()),
     
     provideClientHydration(withEventReplay()),
     provideHttpClient(withInterceptors([errorInterceptorInterceptor,
      jwtTokenInterceptor])),
      ToastrService,
      BrowserAnimationsModule,
  
      importProvidersFrom(

        ToastrModule.forRoot(),
        NgxUiLoaderModule.forRoot({
          fgsColor: "#f16a24",  // Set the default foreground color
          fgsSize: 60,        // Set the default loader size
          fgsPosition: 'center-center',  // Loader position
          bgsColor: 'blue',   // Background color
          bgsOpacity: 0.8,    // Background opacity
          text: 'Loading...', // Optional: Text in the loader
          pbColor:"#f16a24"
        })
      ),
    
      provideNgxMask(),
       provideAnimationsAsync(), 
        provideToastr(
        {preventDuplicates:true}
       ),
        provideHttpClient(withFetch(),withInterceptors([httpInterceptor])),
    ],
   
};
