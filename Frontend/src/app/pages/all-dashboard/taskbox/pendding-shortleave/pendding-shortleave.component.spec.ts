import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenddingShortleaveComponent } from './pendding-shortleave.component';

describe('PenddingShortleaveComponent', () => {
  let component: PenddingShortleaveComponent;
  let fixture: ComponentFixture<PenddingShortleaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenddingShortleaveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenddingShortleaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
