import { TestBed } from '@angular/core/testing';

import { GenerateLettersService } from './generate-letters.service';

describe('GenerateLettersService', () => {
  let service: GenerateLettersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerateLettersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
