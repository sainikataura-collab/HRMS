import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpKraImportComponent } from './emp-kra-import.component';

describe('EmpKraImportComponent', () => {
  let component: EmpKraImportComponent;
  let fixture: ComponentFixture<EmpKraImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpKraImportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpKraImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
