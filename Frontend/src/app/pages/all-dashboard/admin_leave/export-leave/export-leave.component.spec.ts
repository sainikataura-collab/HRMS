import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportLeaveComponent } from './export-leave.component';

describe('ExportLeaveComponent', () => {
  let component: ExportLeaveComponent;
  let fixture: ComponentFixture<ExportLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportLeaveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
