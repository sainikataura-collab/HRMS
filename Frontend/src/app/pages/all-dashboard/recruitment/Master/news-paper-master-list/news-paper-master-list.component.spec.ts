import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsPaperMasterListComponent } from './news-paper-master-list.component';

describe('NewsPaperMasterListComponent', () => {
  let component: NewsPaperMasterListComponent;
  let fixture: ComponentFixture<NewsPaperMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsPaperMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsPaperMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
