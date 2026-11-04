import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebPageMasterListComponent } from './web-page-master-list.component';

describe('WebPageMasterListComponent', () => {
  let component: WebPageMasterListComponent;
  let fixture: ComponentFixture<WebPageMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebPageMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebPageMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
