import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftMasterListComponent } from './shift-master-list.component';

describe('ShiftMasterListComponent', () => {
  let component: ShiftMasterListComponent;
  let fixture: ComponentFixture<ShiftMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
