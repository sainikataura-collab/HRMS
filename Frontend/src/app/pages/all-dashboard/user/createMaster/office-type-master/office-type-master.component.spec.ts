import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeTypeMasterComponent } from './office-type-master.component';

describe('OfficeTypeMasterComponent', () => {
  let component: OfficeTypeMasterComponent;
  let fixture: ComponentFixture<OfficeTypeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficeTypeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
