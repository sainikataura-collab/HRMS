import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionDocListComponent } from './section-doc-list.component';

describe('SectionDocListComponent', () => {
  let component: SectionDocListComponent;
  let fixture: ComponentFixture<SectionDocListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionDocListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionDocListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
