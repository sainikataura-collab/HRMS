import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgViewDashboardComponent } from './org-view-dashboard.component';

describe('OrgViewDashboardComponent', () => {
  let component: OrgViewDashboardComponent;
  let fixture: ComponentFixture<OrgViewDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgViewDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgViewDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
