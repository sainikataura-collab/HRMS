import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexiHeadBillsComponent } from './flexi-head-bills.component';

describe('FlexiHeadBillsComponent', () => {
  let component: FlexiHeadBillsComponent;
  let fixture: ComponentFixture<FlexiHeadBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexiHeadBillsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlexiHeadBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
