import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeniorityLevelComponent } from './seniority-level.component';

describe('SeniorityLevelComponent', () => {
  let component: SeniorityLevelComponent;
  let fixture: ComponentFixture<SeniorityLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeniorityLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeniorityLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
