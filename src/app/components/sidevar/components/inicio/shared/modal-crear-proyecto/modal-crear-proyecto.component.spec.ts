import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearProyectoComponent } from './modal-crear-proyecto.component';

describe('ModalCrearProyectoComponent', () => {
  let component: ModalCrearProyectoComponent;
  let fixture: ComponentFixture<ModalCrearProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCrearProyectoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCrearProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
