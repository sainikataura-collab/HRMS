import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillgenerationComponent } from './billgeneration.component';

describe('BillgenerationComponent', () => {
  let component: BillgenerationComponent;
  let fixture: ComponentFixture<BillgenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillgenerationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillgenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
