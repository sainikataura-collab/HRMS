import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrograssionDetailListComponent } from './prograssion-detail-list.component';

describe('PrograssionDetailListComponent', () => {
  let component: PrograssionDetailListComponent;
  let fixture: ComponentFixture<PrograssionDetailListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrograssionDetailListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrograssionDetailListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
