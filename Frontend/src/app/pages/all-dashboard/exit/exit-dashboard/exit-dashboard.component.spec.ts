import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitDashboardComponent } from './exit-dashboard.component';

describe('ExitDashboardComponent', () => {
  let component: ExitDashboardComponent;
  let fixture: ComponentFixture<ExitDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExitDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExitDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
