import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateMasterListComponent } from './candidate-master-list.component';

describe('CandidateMasterListComponent', () => {
  let component: CandidateMasterListComponent;
  let fixture: ComponentFixture<CandidateMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
