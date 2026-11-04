import { TestBed } from '@angular/core/testing';

import { PageTypeRoleLinkService } from './page-type-role-link.service';

describe('PageTypeRoleLinkService', () => {
  let service: PageTypeRoleLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageTypeRoleLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
