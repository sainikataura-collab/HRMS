import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObCandidateMasterListComponent } from './ob-candidate-master-list.component';

describe('ObCandidateMasterListComponent', () => {
  let component: ObCandidateMasterListComponent;
  let fixture: ComponentFixture<ObCandidateMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObCandidateMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObCandidateMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
