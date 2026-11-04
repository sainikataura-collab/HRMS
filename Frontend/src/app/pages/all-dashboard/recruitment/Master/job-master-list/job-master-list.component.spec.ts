import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobMasterListComponent } from './job-master-list.component';

describe('JobMasterListComponent', () => {
  let component: JobMasterListComponent;
  let fixture: ComponentFixture<JobMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
