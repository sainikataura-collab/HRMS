import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortLeaveRequestListComponent } from './short-leave-request-list.component';

describe('ShortLeaveRequestListComponent', () => {
  let component: ShortLeaveRequestListComponent;
  let fixture: ComponentFixture<ShortLeaveRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortLeaveRequestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortLeaveRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
