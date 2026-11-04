import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimdocStatusComponent } from './reimdoc-status.component';

describe('ReimdocStatusComponent', () => {
  let component: ReimdocStatusComponent;
  let fixture: ComponentFixture<ReimdocStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReimdocStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReimdocStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
