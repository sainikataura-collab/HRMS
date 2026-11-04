import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccidentDetailsComponent } from './accident-details.component';

describe('AccidentDetailsComponent', () => {
  let component: AccidentDetailsComponent;
  let fixture: ComponentFixture<AccidentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccidentDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccidentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
