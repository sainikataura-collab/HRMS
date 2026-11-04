import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsPaperMasterComponent } from './news-paper-master.component';

describe('NewsPaperMasterComponent', () => {
  let component: NewsPaperMasterComponent;
  let fixture: ComponentFixture<NewsPaperMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsPaperMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsPaperMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
