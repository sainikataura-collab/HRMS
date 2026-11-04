import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkLeaveEncashmentComponent } from './bulk-leave-encashment.component';

describe('BulkLeaveEncashmentComponent', () => {
  let component: BulkLeaveEncashmentComponent;
  let fixture: ComponentFixture<BulkLeaveEncashmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkLeaveEncashmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkLeaveEncashmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
