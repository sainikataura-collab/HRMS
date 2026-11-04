import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceDetailListComponent } from './experience-detail-list.component';

describe('ExperienceDetailListComponent', () => {
  let component: ExperienceDetailListComponent;
  let fixture: ComponentFixture<ExperienceDetailListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceDetailListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperienceDetailListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
