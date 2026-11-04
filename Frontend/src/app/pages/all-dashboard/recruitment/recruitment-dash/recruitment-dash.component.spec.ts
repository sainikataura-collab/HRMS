import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentDashComponent } from './recruitment-dash.component';

describe('RecruitmentDashComponent', () => {
  let component: RecruitmentDashComponent;
  let fixture: ComponentFixture<RecruitmentDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruitmentDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitmentDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
