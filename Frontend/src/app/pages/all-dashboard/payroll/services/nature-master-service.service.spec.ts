import { TestBed } from '@angular/core/testing';

import { NatureMasterServiceService } from './nature-master-service.service';

describe('NatureMasterServiceService', () => {
  let service: NatureMasterServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NatureMasterServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
