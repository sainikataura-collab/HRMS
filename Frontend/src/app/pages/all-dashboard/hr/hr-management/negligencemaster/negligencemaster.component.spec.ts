import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NegligencemasterComponent } from './negligencemaster.component';

describe('NegligencemasterComponent', () => {
  let component: NegligencemasterComponent;
  let fixture: ComponentFixture<NegligencemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegligencemasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NegligencemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
