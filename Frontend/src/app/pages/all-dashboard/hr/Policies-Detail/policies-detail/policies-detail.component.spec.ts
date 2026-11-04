import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesDetailComponent } from './policies-detail.component';

describe('PoliciesDetailComponent', () => {
  let component: PoliciesDetailComponent;
  let fixture: ComponentFixture<PoliciesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliciesDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliciesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
