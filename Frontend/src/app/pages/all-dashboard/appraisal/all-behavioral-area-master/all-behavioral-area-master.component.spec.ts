import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllBehavioralAreaMasterComponent } from './all-behavioral-area-master.component';

describe('AllBehavioralAreaMasterComponent', () => {
  let component: AllBehavioralAreaMasterComponent;
  let fixture: ComponentFixture<AllBehavioralAreaMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllBehavioralAreaMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllBehavioralAreaMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
