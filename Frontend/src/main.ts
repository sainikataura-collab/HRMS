import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';


// ── Public Walk-In QR Portal Base URL Fallback ───────────────────────────────
// Leave empty ('') to auto-detect current origin (window.location.origin),
// OR specify custom host e.g. 'https://apply.empowerlogics.com' or 'http://localhost:4200'
(window as any).__PUBLIC_PORTAL_URL__ = '';


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
