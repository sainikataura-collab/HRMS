import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateMasterComponent } from './candidate-master.component';

describe('CandidateMasterComponent', () => {
  let component: CandidateMasterComponent;
  let fixture: ComponentFixture<CandidateMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
