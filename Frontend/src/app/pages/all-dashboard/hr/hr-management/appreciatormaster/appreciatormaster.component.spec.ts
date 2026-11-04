import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppreciatormasterComponent } from './appreciatormaster.component';

describe('AppreciatormasterComponent', () => {
  let component: AppreciatormasterComponent;
  let fixture: ComponentFixture<AppreciatormasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppreciatormasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppreciatormasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
