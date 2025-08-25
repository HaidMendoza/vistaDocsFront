import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProyectosService, Planta } from '../../../../services/proyectos.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

interface Unit {
  id: number;
  number: null | string;
  completed: boolean;
  polygon: number[][];
  angle: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  debugImageUrl: string;
  plant: any;
}

interface ExtendedPlanta extends Planta {
  boxedImageUrl?: string;
  units?: Unit[];
}

@Component({
  selector: 'app-plantas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './plantas.component.html',
  styleUrls: ['./plantas.component.scss']
})
export class PlantasComponent implements OnInit {
  imagenPrevisualizada: string | ArrayBuffer | null = null;
  fileSeleccionado: File | null = null;
  plantaForm!: FormGroup;
  plantaActual: ExtendedPlanta | null = null;
  dragOver: boolean = false;
  imageWidth: number = 0;
  imageHeight: number = 0;
  isUploading: boolean = false;
  isDetecting: boolean = false;
  
  // Propiedades para el modal
  unidadSeleccionada: number | null = null;
  modalAbierto: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private proyectosService: ProyectosService
  ) {}

  ngOnInit(): void {
    this.plantaForm = this.fb.group({
      name: ['', Validators.required],
      level: [1, [Validators.required, Validators.min(0)]],
      projectId: [1, [Validators.required, Validators.min(1)]],
      floorPlan: [null]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    this.fileSeleccionado = file;
    const reader = new FileReader();
    reader.onload = () => this.imagenPrevisualizada = reader.result;
    reader.readAsDataURL(this.fileSeleccionado);
  }

  cancelarSubida(): void {
    this.imagenPrevisualizada = null;
    this.fileSeleccionado = null;
    this.plantaForm.patchValue({ floorPlan: null });
  }

  crearPlanta(): void {
    if (this.plantaForm.invalid || !this.fileSeleccionado) {
      this.plantaForm.markAllAsTouched();
      return;
    }

    this.isUploading = true;

    const formData = new FormData();
    formData.append('name', this.plantaForm.get('name')?.value);
    formData.append('level', this.plantaForm.get('level')?.value.toString());
    formData.append('projectId', this.plantaForm.get('projectId')?.value.toString());
    formData.append('floorPlan', this.fileSeleccionado, this.fileSeleccionado.name);

    this.proyectosService.crearPlanta(formData).pipe(
      tap((plantaCreada: ExtendedPlanta) => {
        this.isUploading = false;
        alert(`✅ Planta "${plantaCreada.name}" creada con éxito`);
        
        this.plantaActual = plantaCreada;
        this.prepararVisualizacion();
        
        this.plantaForm.reset({ projectId: plantaCreada.projectId, level: 1 });
        this.imagenPrevisualizada = null;
        this.fileSeleccionado = null;
      }),
      catchError(error => {
        this.isUploading = false;
        alert('❌ Error al crear la planta. Intenta nuevamente.');
        console.error(error);
        return of(null);
      })
    ).subscribe();
  }

  private prepararVisualizacion(): void {
    if (this.plantaActual?.floorPlanUrl) {
      const img = new Image();
      img.src = this.plantaActual.floorPlanUrl;
      img.onload = () => {
        this.imageWidth = img.width;
        this.imageHeight = img.height;
      };
    }
  }

  detectarUnidadesEnPlano(): void {
    if (!this.plantaActual) {
      alert('No hay planta cargada');
      return;
    }

    this.isDetecting = true;

    this.proyectosService.detectarUnidadesEnPlano(this.plantaActual.id).pipe(
      tap(response => {
        console.log('Unidades detectadas:', response);
        alert('✅ Unidades detectadas con éxito');
        
        if (this.plantaActual) {
          this.plantaActual.units = response.units;
          this.plantaActual.boxedImageUrl = response.image_with_boxes;
        }
        
        this.isDetecting = false;
      }),
      catchError(error => {
        console.error('Error en detección de unidades:', error);
        alert('❌ Error al detectar unidades');
        this.isDetecting = false;
        return of(null);
      })
    ).subscribe();
  }

  getPoints(polygon: number[][]): string {
    return polygon.map(point => point.join(',')).join(' ');
  }

  limpiarPlanta(): void {
    if (confirm('¿Estás seguro de que quieres limpiar la planta actual?')) {
      this.plantaActual = null;
      this.imageWidth = 0;
      this.imageHeight = 0;
    }
  }

  // Métodos para el modal
  abrirModalUnidad(unitId: number): void {
    console.log('Abriendo modal para unidad:', unitId);
    this.unidadSeleccionada = unitId;
    this.modalAbierto = true;
    
    // Opcional: prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    console.log('Cerrando modal');
    this.unidadSeleccionada = null;
    this.modalAbierto = false;
    
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  // Método para obtener información completa de la unidad seleccionada
  obtenerUnidadCompleta(): Unit | null {
    if (!this.plantaActual?.units || !this.unidadSeleccionada) {
      return null;
    }
    
    return this.plantaActual.units.find(unit => unit.id === this.unidadSeleccionada) || null;
  }

  // Método para cerrar modal al hacer click fuera del contenido
  onModalBackdropClick(event: Event): void {
    // Solo cerrar si el click fue en el backdrop, no en el contenido del modal
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }

  // Método para manejar teclas del teclado (Escape para cerrar)
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.modalAbierto) {
      this.cerrarModal();
    }
  }

  
}