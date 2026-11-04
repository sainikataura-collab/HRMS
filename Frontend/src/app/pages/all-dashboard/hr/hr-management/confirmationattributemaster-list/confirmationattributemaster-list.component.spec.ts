import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationattributemasterListComponent } from './confirmationattributemaster-list.component';

describe('ConfirmationattributemasterListComponent', () => {
  let component: ConfirmationattributemasterListComponent;
  let fixture: ComponentFixture<ConfirmationattributemasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationattributemasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationattributemasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
