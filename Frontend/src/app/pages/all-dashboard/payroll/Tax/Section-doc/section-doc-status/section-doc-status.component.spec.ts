import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionDocStatusComponent } from './section-doc-status.component';

describe('SectionDocStatusComponent', () => {
  let component: SectionDocStatusComponent;
  let fixture: ComponentFixture<SectionDocStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionDocStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionDocStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
