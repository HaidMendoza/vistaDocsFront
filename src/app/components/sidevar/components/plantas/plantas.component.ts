import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalEditarUnidadComponent } from '../../../../shared/modal-editar-unidad/modal-editar-unidad.component';
import { ProyectosService , Planta } from '../../../../services/proyectos.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-plantas',
  standalone: true,
  imports: [CommonModule, ModalEditarUnidadComponent, ReactiveFormsModule], // Importar ReactiveFormsModule
  templateUrl: './plantas.component.html',
  styleUrl: './plantas.component.scss'
})
export class PlantasComponent implements OnInit {
  imagenPrevisualizada: string | ArrayBuffer | null = null;
  fileSeleccionado: File | null = null;
  plantaForm!: FormGroup;
  plantas: Planta[] = []; // Array para almacenar las plantas obtenidas

  // Inyectamos el servicio de proyectos y el FormBuilder
  constructor(private fb: FormBuilder, private proyectosService: ProyectosService) {}

  ngOnInit(): void {
    // Inicializamos el formulario con los campos que espera el backend
    this.plantaForm = this.fb.group({
      name: ['', Validators.required],
      level: ['', [Validators.required, Validators.min(0)]],
      projectId: ['', [Validators.required, Validators.min(1)]],
      floorPlan: [null] // Campo para el archivo
    });

    // Ejemplo de cómo obtener las plantas al inicializar el componente
    // Reemplaza '1' con el ID de proyecto real.
    this.obtenerPlantasPorProyecto(1); 
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.fileSeleccionado = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imagenPrevisualizada = reader.result;
      };

      reader.readAsDataURL(this.fileSeleccionado);
    }
  }

  /**
   * Método para crear una nueva planta.
   * Envía los datos del formulario y el archivo al servicio.
   */
  crearPlanta(): void {
    if (this.plantaForm.invalid) {
      this.plantaForm.markAllAsTouched();
      return;
    }

    // Creamos un objeto FormData para enviar los datos y el archivo
    const formData = new FormData();
    formData.append('name', this.plantaForm.get('name')?.value);
    formData.append('level', this.plantaForm.get('level')?.value);
    formData.append('projectId', this.plantaForm.get('projectId')?.value);

    // Agregamos el archivo si existe
    if (this.fileSeleccionado) {
      formData.append('floorPlan', this.fileSeleccionado, this.fileSeleccionado.name);
    }

    this.proyectosService.crearPlanta(formData).pipe(
      tap(plantaCreada => {
        console.log('Planta creada con éxito:', plantaCreada);
        this.plantaForm.reset(); // Limpia el formulario
        this.imagenPrevisualizada = null;
        this.fileSeleccionado = null;
        // Opcionalmente, recargar la lista de plantas
        this.obtenerPlantasPorProyecto(plantaCreada.projectId);
      }),
      catchError(error => {
        console.error('Error al crear la planta:', error);
        // Manejo de errores
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Método para obtener las plantas de un proyecto.
   */
  obtenerPlantasPorProyecto(projectId: number): void {
    this.proyectosService.obtenerPlantasPorProyecto(projectId).pipe(
      tap(plantas => {
        this.plantas = plantas;
        console.log('Plantas obtenidas:', this.plantas);
      }),
      catchError(error => {
        console.error('Error al obtener las plantas:', error);
        return of([]);
      })
    ).subscribe();
  }

  /**
   * Método para detectar unidades en un plano.
   */
  detectarUnidadesEnPlano(plantaId: number): void {
    this.proyectosService.detectarUnidadesEnPlano(plantaId).pipe(
      tap(response => {
        console.log('Detección de unidades exitosa:', response);
      }),
      catchError(error => {
        console.error('Error al detectar unidades:', error);
        return of(null);
      })
    ).subscribe();
  }
}
