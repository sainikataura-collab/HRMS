import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgViewDashComponent } from './org-view-dash.component';

describe('OrgViewDashComponent', () => {
  let component: OrgViewDashComponent;
  let fixture: ComponentFixture<OrgViewDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgViewDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgViewDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
