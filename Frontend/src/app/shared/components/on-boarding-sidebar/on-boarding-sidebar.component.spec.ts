import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBoardingSidebarComponent } from './on-boarding-sidebar.component';

describe('OnBoardingSidebarComponent', () => {
  let component: OnBoardingSidebarComponent;
  let fixture: ComponentFixture<OnBoardingSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBoardingSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBoardingSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
