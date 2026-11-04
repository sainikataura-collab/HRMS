import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioAttendanceRepotsComponent } from './bio-attendance-repots.component';

describe('BioAttendanceRepotsComponent', () => {
  let component: BioAttendanceRepotsComponent;
  let fixture: ComponentFixture<BioAttendanceRepotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BioAttendanceRepotsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BioAttendanceRepotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
