import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorDashComponent } from './visitor-dash.component';

describe('VisitorDashComponent', () => {
  let component: VisitorDashComponent;
  let fixture: ComponentFixture<VisitorDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
