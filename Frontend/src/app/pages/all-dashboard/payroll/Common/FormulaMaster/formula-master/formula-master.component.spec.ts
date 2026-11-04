import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaMasterComponent } from './formula-master.component';

describe('FormulaMasterComponent', () => {
  let component: FormulaMasterComponent;
  let fixture: ComponentFixture<FormulaMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulaMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
