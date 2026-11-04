import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllFunctionalMasterComponent } from './all-functional-master.component';

describe('AllFunctionalMasterComponent', () => {
  let component: AllFunctionalMasterComponent;
  let fixture: ComponentFixture<AllFunctionalMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllFunctionalMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllFunctionalMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
