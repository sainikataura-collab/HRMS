import { TestBed } from '@angular/core/testing';

import { FormulaMasterService } from './formula-master.service';

describe('FormulaMasterService', () => {
  let service: FormulaMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormulaMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
