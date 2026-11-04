import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeTypeMasterListComponent } from './office-type-master-list.component';

describe('OfficeTypeMasterListComponent', () => {
  let component: OfficeTypeMasterListComponent;
  let fixture: ComponentFixture<OfficeTypeMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficeTypeMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeTypeMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
