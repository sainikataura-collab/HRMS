import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreeningCommitteeListComponent } from './screening-committee-list.component';

describe('ScreeningCommitteeListComponent', () => {
  let component: ScreeningCommitteeListComponent;
  let fixture: ComponentFixture<ScreeningCommitteeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreeningCommitteeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreeningCommitteeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
