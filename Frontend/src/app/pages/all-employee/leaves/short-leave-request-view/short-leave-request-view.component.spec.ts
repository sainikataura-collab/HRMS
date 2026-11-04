import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortLeaveRequestViewComponent } from './short-leave-request-view.component';

describe('ShortLeaveRequestViewComponent', () => {
  let component: ShortLeaveRequestViewComponent;
  let fixture: ComponentFixture<ShortLeaveRequestViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortLeaveRequestViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortLeaveRequestViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
