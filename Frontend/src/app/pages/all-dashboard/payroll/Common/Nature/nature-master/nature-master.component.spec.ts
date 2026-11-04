import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NatureMasterComponent } from './nature-master.component';

describe('NatureMasterComponent', () => {
  let component: NatureMasterComponent;
  let fixture: ComponentFixture<NatureMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NatureMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NatureMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
