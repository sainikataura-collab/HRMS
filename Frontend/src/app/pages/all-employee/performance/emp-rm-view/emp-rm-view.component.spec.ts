import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpRmViewComponent } from './emp-rm-view.component';

describe('EmpRmViewComponent', () => {
  let component: EmpRmViewComponent;
  let fixture: ComponentFixture<EmpRmViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpRmViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpRmViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
