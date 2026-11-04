import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportLeaveTakenComponent } from './import-leave-taken.component';

describe('ImportLeaveTakenComponent', () => {
  let component: ImportLeaveTakenComponent;
  let fixture: ComponentFixture<ImportLeaveTakenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportLeaveTakenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportLeaveTakenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
