import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxconfigurationComponent } from './taxconfiguration.component';

describe('TaxconfigurationComponent', () => {
  let component: TaxconfigurationComponent;
  let fixture: ComponentFixture<TaxconfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxconfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxconfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
