import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentModeMasterComponent } from './recruitment-mode-master.component';

describe('RecruitmentModeMasterComponent', () => {
  let component: RecruitmentModeMasterComponent;
  let fixture: ComponentFixture<RecruitmentModeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruitmentModeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitmentModeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
