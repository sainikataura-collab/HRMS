import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppreciatormasterListComponent } from './appreciatormaster-list.component';

describe('AppreciatormasterListComponent', () => {
  let component: AppreciatormasterListComponent;
  let fixture: ComponentFixture<AppreciatormasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppreciatormasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppreciatormasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
