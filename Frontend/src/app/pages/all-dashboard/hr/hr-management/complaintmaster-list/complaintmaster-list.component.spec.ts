import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintmasterListComponent } from './complaintmaster-list.component';

describe('ComplaintmasterListComponent', () => {
  let component: ComplaintmasterListComponent;
  let fixture: ComponentFixture<ComplaintmasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintmasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplaintmasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
