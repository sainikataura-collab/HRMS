import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftMasterComponent } from './shift-master.component';

describe('ShiftMasterComponent', () => {
  let component: ShiftMasterComponent;
  let fixture: ComponentFixture<ShiftMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
