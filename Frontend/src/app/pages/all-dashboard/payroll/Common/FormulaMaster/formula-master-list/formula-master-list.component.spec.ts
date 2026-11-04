import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaMasterListComponent } from './formula-master-list.component';

describe('FormulaMasterListComponent', () => {
  let component: FormulaMasterListComponent;
  let fixture: ComponentFixture<FormulaMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulaMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
