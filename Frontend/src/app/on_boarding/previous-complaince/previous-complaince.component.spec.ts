import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousComplainceComponent } from './previous-complaince.component';

describe('PreviousComplainceComponent', () => {
  let component: PreviousComplainceComponent;
  let fixture: ComponentFixture<PreviousComplainceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousComplainceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousComplainceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
