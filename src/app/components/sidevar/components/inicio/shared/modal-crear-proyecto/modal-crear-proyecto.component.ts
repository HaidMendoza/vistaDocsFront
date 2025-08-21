// src/app/components/modals/modal-crear-proyecto/modal-crear-proyecto.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProyectosService } from '../../../../../../services/proyectos.service';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-crear-proyecto',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './modal-crear-proyecto.component.html',
  styleUrls: ['./modal-crear-proyecto.component.scss']
})
export class ModalCrearProyectoComponent implements OnInit {
  @Output() modalCerrado = new EventEmitter<boolean>();
  proyectoForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectosService
  ) {}

  ngOnInit(): void {
    this.proyectoForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['', Validators.required]
    });
  }

  cerrarModal() {
    this.modalCerrado.emit(false);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.proyectoForm.patchValue({ imageUrl: this.selectedFile.name });
    }
  }

  guardarProyecto() {
    if (this.proyectoForm.invalid || !this.selectedFile) {
      this.proyectoForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('name', this.proyectoForm.get('name')?.value);
    formData.append('address', this.proyectoForm.get('address')?.value);
    formData.append('description', this.proyectoForm.get('description')?.value);
    formData.append('image', this.selectedFile);

    this.proyectoService.crearProyecto(formData).pipe(
      tap(response => {
        console.log('Proyecto creado:', response);

        // ✅ Mostrar mensaje de éxito
        alert('✅ Proyecto creado con éxito');

        // ✅ Cerrar el modal
        this.cerrarModal();
      }),
      catchError(error => {
        console.error('Error al crear proyecto:', error);
        alert('❌ Hubo un error al crear el proyecto');
        return throwError(() => new Error('Error al crear proyecto'));
      })
    ).subscribe();
  }
}
