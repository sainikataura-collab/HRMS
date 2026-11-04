import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportLeaveNewComponent } from './export-leave-new.component';

describe('ExportLeaveNewComponent', () => {
  let component: ExportLeaveNewComponent;
  let fixture: ComponentFixture<ExportLeaveNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportLeaveNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportLeaveNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
