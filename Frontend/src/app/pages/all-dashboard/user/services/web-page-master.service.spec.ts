import { TestBed } from '@angular/core/testing';

import { WebPageMasterService } from './web-page-master.service';

describe('WebPageMasterService', () => {
  let service: WebPageMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebPageMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
