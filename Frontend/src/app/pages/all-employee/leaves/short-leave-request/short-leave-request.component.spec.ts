import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortLeaveRequestComponent } from './short-leave-request.component';

describe('ShortLeaveRequestComponent', () => {
  let component: ShortLeaveRequestComponent;
  let fixture: ComponentFixture<ShortLeaveRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortLeaveRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortLeaveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
