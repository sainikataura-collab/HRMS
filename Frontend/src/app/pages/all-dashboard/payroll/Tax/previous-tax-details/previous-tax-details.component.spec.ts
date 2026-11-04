import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousTaxDetailsComponent } from './previous-tax-details.component';

describe('PreviousTaxDetailsComponent', () => {
  let component: PreviousTaxDetailsComponent;
  let fixture: ComponentFixture<PreviousTaxDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousTaxDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousTaxDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
