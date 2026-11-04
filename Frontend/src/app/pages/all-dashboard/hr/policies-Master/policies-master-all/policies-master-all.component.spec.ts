import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesMasterAllComponent } from './policies-master-all.component';

describe('PoliciesMasterAllComponent', () => {
  let component: PoliciesMasterAllComponent;
  let fixture: ComponentFixture<PoliciesMasterAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliciesMasterAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliciesMasterAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
