import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebPageMasterComponent } from './web-page-master.component';

describe('WebPageMasterComponent', () => {
  let component: WebPageMasterComponent;
  let fixture: ComponentFixture<WebPageMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebPageMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebPageMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
