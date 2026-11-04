import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NatureDetailComponent } from './nature-detail.component';

describe('NatureDetailComponent', () => {
  let component: NatureDetailComponent;
  let fixture: ComponentFixture<NatureDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NatureDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NatureDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
