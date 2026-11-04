import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrearProcessComponent } from './arrear-process.component';

describe('ArrearProcessComponent', () => {
  let component: ArrearProcessComponent;
  let fixture: ComponentFixture<ArrearProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrearProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrearProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
