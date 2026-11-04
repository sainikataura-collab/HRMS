import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationattributemasterComponent } from './confirmationattributemaster.component';

describe('ConfirmationattributemasterComponent', () => {
  let component: ConfirmationattributemasterComponent;
  let fixture: ComponentFixture<ConfirmationattributemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationattributemasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationattributemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
