import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTypeRoleLinkListComponent } from './page-type-role-link-list.component';

describe('PageTypeRoleLinkListComponent', () => {
  let component: PageTypeRoleLinkListComponent;
  let fixture: ComponentFixture<PageTypeRoleLinkListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTypeRoleLinkListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageTypeRoleLinkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
