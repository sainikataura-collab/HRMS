import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewHeadAssignComponent } from './new-head-assign.component';

describe('NewHeadAssignComponent', () => {
  let component: NewHeadAssignComponent;
  let fixture: ComponentFixture<NewHeadAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewHeadAssignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewHeadAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
