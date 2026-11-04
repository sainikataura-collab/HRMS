import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitDashComponent } from './exit-dash.component';

describe('ExitDashComponent', () => {
  let component: ExitDashComponent;
  let fixture: ComponentFixture<ExitDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExitDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExitDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
