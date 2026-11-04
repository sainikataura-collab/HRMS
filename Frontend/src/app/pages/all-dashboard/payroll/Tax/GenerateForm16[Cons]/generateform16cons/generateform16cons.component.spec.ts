import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Generateform16consComponent } from './generateform16cons.component';

describe('Generateform16consComponent', () => {
  let component: Generateform16consComponent;
  let fixture: ComponentFixture<Generateform16consComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Generateform16consComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Generateform16consComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
