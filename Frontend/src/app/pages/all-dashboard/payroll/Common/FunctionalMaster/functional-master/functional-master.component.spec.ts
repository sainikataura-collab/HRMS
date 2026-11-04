import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionalMasterComponent } from './functional-master.component';

describe('FunctionalMasterComponent', () => {
  let component: FunctionalMasterComponent;
  let fixture: ComponentFixture<FunctionalMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FunctionalMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FunctionalMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
