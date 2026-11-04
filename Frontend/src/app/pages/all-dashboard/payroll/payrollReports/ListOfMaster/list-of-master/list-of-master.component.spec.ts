import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfMasterComponent } from './list-of-master.component';

describe('ListOfMasterComponent', () => {
  let component: ListOfMasterComponent;
  let fixture: ComponentFixture<ListOfMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOfMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
