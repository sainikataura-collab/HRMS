import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductInterviewListComponent } from './conduct-interview-list.component';

describe('ConductInterviewListComponent', () => {
  let component: ConductInterviewListComponent;
  let fixture: ComponentFixture<ConductInterviewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConductInterviewListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConductInterviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
