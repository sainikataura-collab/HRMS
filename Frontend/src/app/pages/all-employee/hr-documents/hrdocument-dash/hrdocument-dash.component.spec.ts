import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrdocumentDashComponent } from './hrdocument-dash.component';

describe('HrdocumentDashComponent', () => {
  let component: HrdocumentDashComponent;
  let fixture: ComponentFixture<HrdocumentDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrdocumentDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrdocumentDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
