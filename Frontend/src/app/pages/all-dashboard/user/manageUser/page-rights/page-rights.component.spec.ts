import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageRightsComponent } from './page-rights.component';

describe('PageRightsComponent', () => {
  let component: PageRightsComponent;
  let fixture: ComponentFixture<PageRightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageRightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
