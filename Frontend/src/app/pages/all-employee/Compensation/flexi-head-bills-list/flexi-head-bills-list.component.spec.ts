import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexiHeadBillsListComponent } from './flexi-head-bills-list.component';

describe('FlexiHeadBillsListComponent', () => {
  let component: FlexiHeadBillsListComponent;
  let fixture: ComponentFixture<FlexiHeadBillsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlexiHeadBillsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlexiHeadBillsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
