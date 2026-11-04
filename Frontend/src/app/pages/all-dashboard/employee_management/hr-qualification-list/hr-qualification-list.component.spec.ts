import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrQualificationListComponent } from './hr-qualification-list.component';

describe('HrQualificationListComponent', () => {
  let component: HrQualificationListComponent;
  let fixture: ComponentFixture<HrQualificationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrQualificationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrQualificationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
