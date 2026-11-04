import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffRequestListComponent } from './comp-off-request-list.component';

describe('CompOffRequestListComponent', () => {
  let component: CompOffRequestListComponent;
  let fixture: ComponentFixture<CompOffRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompOffRequestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
