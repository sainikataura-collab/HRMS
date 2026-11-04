import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DueclearencemasterComponent } from './dueclearencemaster.component';

describe('DueclearencemasterComponent', () => {
  let component: DueclearencemasterComponent;
  let fixture: ComponentFixture<DueclearencemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DueclearencemasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DueclearencemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
