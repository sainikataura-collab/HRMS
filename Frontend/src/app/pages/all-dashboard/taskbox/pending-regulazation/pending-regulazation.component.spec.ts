import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingRegulazationComponent } from './pending-regulazation.component';

describe('PendingRegulazationComponent', () => {
  let component: PendingRegulazationComponent;
  let fixture: ComponentFixture<PendingRegulazationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingRegulazationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingRegulazationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
