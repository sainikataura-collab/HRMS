import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductInterviewComponent } from './conduct-interview.component';

describe('ConductInterviewComponent', () => {
  let component: ConductInterviewComponent;
  let fixture: ComponentFixture<ConductInterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConductInterviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConductInterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
