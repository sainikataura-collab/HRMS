import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobMasterComponent } from './job-master.component';

describe('JobMasterComponent', () => {
  let component: JobMasterComponent;
  let fixture: ComponentFixture<JobMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
