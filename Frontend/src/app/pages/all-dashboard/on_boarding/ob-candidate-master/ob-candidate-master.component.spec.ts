import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObCandidateMasterComponent } from './ob-candidate-master.component';

describe('ObCandidateMasterComponent', () => {
  let component: ObCandidateMasterComponent;
  let fixture: ComponentFixture<ObCandidateMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObCandidateMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObCandidateMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
