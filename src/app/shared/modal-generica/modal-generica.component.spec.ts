import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGenericaComponent } from './modal-generica.component';

describe('ModalGenericaComponent', () => {
  let component: ModalGenericaComponent;
  let fixture: ComponentFixture<ModalGenericaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalGenericaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalGenericaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
