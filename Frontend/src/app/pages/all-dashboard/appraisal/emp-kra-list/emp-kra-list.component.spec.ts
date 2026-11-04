import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpKraListComponent } from './emp-kra-list.component';

describe('EmpKraListComponent', () => {
  let component: EmpKraListComponent;
  let fixture: ComponentFixture<EmpKraListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpKraListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpKraListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
