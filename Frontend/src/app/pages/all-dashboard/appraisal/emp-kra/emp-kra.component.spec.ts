import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpKraComponent } from './emp-kra.component';

describe('EmpKraComponent', () => {
  let component: EmpKraComponent;
  let fixture: ComponentFixture<EmpKraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpKraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpKraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
