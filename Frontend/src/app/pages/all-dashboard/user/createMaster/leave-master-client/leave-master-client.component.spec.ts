import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveMasterClientComponent } from './leave-master-client.component';

describe('LeaveMasterClientComponent', () => {
  let component: LeaveMasterClientComponent;
  let fixture: ComponentFixture<LeaveMasterClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveMasterClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveMasterClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
