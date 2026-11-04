import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllAccountMasterComponent } from './all-account-master.component';

describe('AllAccountMasterComponent', () => {
  let component: AllAccountMasterComponent;
  let fixture: ComponentFixture<AllAccountMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllAccountMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllAccountMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
