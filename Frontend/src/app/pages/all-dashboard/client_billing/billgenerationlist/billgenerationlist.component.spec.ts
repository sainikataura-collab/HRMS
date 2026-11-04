import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillgenerationlistComponent } from './billgenerationlist.component';

describe('BillgenerationlistComponent', () => {
  let component: BillgenerationlistComponent;
  let fixture: ComponentFixture<BillgenerationlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillgenerationlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillgenerationlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
