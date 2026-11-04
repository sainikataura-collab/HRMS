import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveMasterClientListComponent } from './leave-master-client-list.component';

describe('LeaveMasterClientListComponent', () => {
  let component: LeaveMasterClientListComponent;
  let fixture: ComponentFixture<LeaveMasterClientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveMasterClientListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveMasterClientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
