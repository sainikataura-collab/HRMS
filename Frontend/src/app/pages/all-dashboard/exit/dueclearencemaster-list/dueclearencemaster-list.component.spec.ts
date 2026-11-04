import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DueclearencemasterListComponent } from './dueclearencemaster-list.component';

describe('DueclearencemasterListComponent', () => {
  let component: DueclearencemasterListComponent;
  let fixture: ComponentFixture<DueclearencemasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DueclearencemasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DueclearencemasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
