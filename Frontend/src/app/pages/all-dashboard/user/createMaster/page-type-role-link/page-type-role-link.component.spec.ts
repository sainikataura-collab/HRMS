import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTypeRoleLinkComponent } from './page-type-role-link.component';

describe('PageTypeRoleLinkComponent', () => {
  let component: PageTypeRoleLinkComponent;
  let fixture: ComponentFixture<PageTypeRoleLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTypeRoleLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageTypeRoleLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
