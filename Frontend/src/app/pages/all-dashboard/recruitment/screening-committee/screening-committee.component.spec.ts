import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreeningCommitteeComponent } from './screening-committee.component';

describe('ScreeningCommitteeComponent', () => {
  let component: ScreeningCommitteeComponent;
  let fixture: ComponentFixture<ScreeningCommitteeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreeningCommitteeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreeningCommitteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
