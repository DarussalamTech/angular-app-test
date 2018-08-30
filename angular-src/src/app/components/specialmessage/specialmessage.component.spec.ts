import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialmessageComponent } from './specialmessage.component';

describe('SpecialmessageComponent', () => {
  let component: SpecialmessageComponent;
  let fixture: ComponentFixture<SpecialmessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialmessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialmessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
