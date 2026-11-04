import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintmasterComponent } from './complaintmaster.component';

describe('ComplaintmasterComponent', () => {
  let component: ComplaintmasterComponent;
  let fixture: ComponentFixture<ComplaintmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintmasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplaintmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
