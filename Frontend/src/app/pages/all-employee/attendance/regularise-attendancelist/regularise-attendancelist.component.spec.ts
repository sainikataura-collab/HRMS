import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegulariseAttendancelistComponent } from './regularise-attendancelist.component';

describe('RegulariseAttendancelistComponent', () => {
  let component: RegulariseAttendancelistComponent;
  let fixture: ComponentFixture<RegulariseAttendancelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegulariseAttendancelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegulariseAttendancelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
