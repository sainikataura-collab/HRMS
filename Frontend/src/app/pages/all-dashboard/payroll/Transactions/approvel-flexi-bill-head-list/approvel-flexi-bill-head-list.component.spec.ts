import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovelFlexiBillHeadListComponent } from './approvel-flexi-bill-head-list.component';

describe('ApprovelFlexiBillHeadListComponent', () => {
  let component: ApprovelFlexiBillHeadListComponent;
  let fixture: ComponentFixture<ApprovelFlexiBillHeadListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovelFlexiBillHeadListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovelFlexiBillHeadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
