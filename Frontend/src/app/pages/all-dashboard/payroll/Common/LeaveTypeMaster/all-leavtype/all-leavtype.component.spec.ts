import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllLeavtypeComponent } from './all-leavtype.component';

describe('AllLeavtypeComponent', () => {
  let component: AllLeavtypeComponent;
  let fixture: ComponentFixture<AllLeavtypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllLeavtypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllLeavtypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
