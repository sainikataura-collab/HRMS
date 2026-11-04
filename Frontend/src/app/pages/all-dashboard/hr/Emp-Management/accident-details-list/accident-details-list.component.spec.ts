import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccidentDetailsListComponent } from './accident-details-list.component';

describe('AccidentDetailsListComponent', () => {
  let component: AccidentDetailsListComponent;
  let fixture: ComponentFixture<AccidentDetailsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccidentDetailsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccidentDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
