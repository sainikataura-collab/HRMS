import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesMasterComponent } from './policies-master.component';

describe('PoliciesMasterComponent', () => {
  let component: PoliciesMasterComponent;
  let fixture: ComponentFixture<PoliciesMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliciesMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliciesMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
