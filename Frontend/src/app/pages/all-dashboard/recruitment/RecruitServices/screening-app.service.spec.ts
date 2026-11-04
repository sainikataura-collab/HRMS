import { TestBed } from '@angular/core/testing';

import { ScreeningAppService } from './screening-app.service';

describe('ScreeningAppService', () => {
  let service: ScreeningAppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScreeningAppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
