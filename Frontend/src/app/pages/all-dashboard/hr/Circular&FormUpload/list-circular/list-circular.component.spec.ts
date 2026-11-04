import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCircularComponent } from './list-circular.component';

describe('ListCircularComponent', () => {
  let component: ListCircularComponent;
  let fixture: ComponentFixture<ListCircularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCircularComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCircularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
