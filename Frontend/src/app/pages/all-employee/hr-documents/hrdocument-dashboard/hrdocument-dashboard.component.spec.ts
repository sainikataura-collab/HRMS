import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrdocumentDashboardComponent } from './hrdocument-dashboard.component';

describe('HrdocumentDashboardComponent', () => {
  let component: HrdocumentDashboardComponent;
  let fixture: ComponentFixture<HrdocumentDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrdocumentDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrdocumentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
