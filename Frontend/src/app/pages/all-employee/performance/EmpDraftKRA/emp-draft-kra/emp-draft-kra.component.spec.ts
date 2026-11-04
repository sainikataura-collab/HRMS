import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpDraftKRAComponent } from './emp-draft-kra.component';

describe('EmpDraftKRAComponent', () => {
  let component: EmpDraftKRAComponent;
  let fixture: ComponentFixture<EmpDraftKRAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpDraftKRAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpDraftKRAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
