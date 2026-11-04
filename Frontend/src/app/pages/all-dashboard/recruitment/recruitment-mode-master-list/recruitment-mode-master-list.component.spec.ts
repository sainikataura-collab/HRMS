import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentModeMasterListComponent } from './recruitment-mode-master-list.component';

describe('RecruitmentModeMasterListComponent', () => {
  let component: RecruitmentModeMasterListComponent;
  let fixture: ComponentFixture<RecruitmentModeMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruitmentModeMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitmentModeMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
