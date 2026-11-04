import { TestBed } from '@angular/core/testing';

import { HrChatService } from './hr-chat.service';

describe('HrChatService', () => {
  let service: HrChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HrChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
