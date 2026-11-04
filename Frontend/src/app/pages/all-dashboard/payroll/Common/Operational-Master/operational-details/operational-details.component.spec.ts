import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationalDetailsComponent } from './operational-details.component';

describe('OperationalDetailsComponent', () => {
  let component: OperationalDetailsComponent;
  let fixture: ComponentFixture<OperationalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationalDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
