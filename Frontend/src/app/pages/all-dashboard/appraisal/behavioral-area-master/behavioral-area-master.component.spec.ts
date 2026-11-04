import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BehavioralAreaMasterComponent } from './behavioral-area-master.component';

describe('BehavioralAreaMasterComponent', () => {
  let component: BehavioralAreaMasterComponent;
  let fixture: ComponentFixture<BehavioralAreaMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BehavioralAreaMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BehavioralAreaMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
