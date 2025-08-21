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
  plantas: ExtendedPlanta[] = [];
  dragOver: boolean = false;
  showModal: boolean = false;
  selectedPlanta: ExtendedPlanta | null = null;
  imageWidth: number = 0;
  imageHeight: number = 0;
  isUploading: boolean = false;

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

    // Cargar plantas al inicializar el componente
    this.cargarTodasLasPlantas();
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
        
        // Limpiar formulario
        this.plantaForm.reset({ projectId: plantaCreada.projectId, level: 1 });
        this.imagenPrevisualizada = null;
        this.fileSeleccionado = null;
        
        // Recargar todas las plantas para mostrar la nueva
        this.cargarTodasLasPlantas();
      }),
      catchError(error => {
        this.isUploading = false;
        alert('❌ Error al crear la planta. Intenta nuevamente.');
        console.error(error);
        return of(null);
      })
    ).subscribe();
  }

  // Método para cargar todas las plantas (cambiar según tu endpoint)
  cargarTodasLasPlantas(): void {
    // Si tienes un endpoint que traiga todas las plantas, úsalo aquí
    // Por ejemplo: this.proyectosService.obtenerTodasLasPlantas()
    
    // Por ahora, usando el método existente con projectId = 1
    this.proyectosService.obtenerPlantasPorProyecto(1).pipe(
      tap(plantas => {
        this.plantas = plantas as ExtendedPlanta[];
        console.log('Plantas cargadas:', this.plantas);
      }),
      catchError(error => {
        console.error('Error al obtener plantas:', error);
        this.plantas = [];
        return of([]);
      })
    ).subscribe();
  }

  detectarUnidadesEnPlano(plantaId: number): void {
    this.proyectosService.detectarUnidadesEnPlano(plantaId).pipe(
      tap(response => {
        console.log('Unidades detectadas:', response);
        alert('✅ Unidades detectadas con éxito');
        const planta = this.plantas.find(p => p.id === plantaId);
        if (planta) {
          planta.units = response.units;
          planta.boxedImageUrl = response.image_with_boxes;
        }
      }),
      catchError(error => {
        console.error('Error en detección de unidades:', error);
        alert('❌ Error al detectar unidades');
        return of(null);
      })
    ).subscribe();
  }

  openModal(planta: ExtendedPlanta): void {
    if (planta.units && planta.units.length > 0) {
      this.selectedPlanta = planta;
      const img = new Image();
      img.src = planta.floorPlanUrl;
      img.onload = () => {
        this.imageWidth = img.width;
        this.imageHeight = img.height;
        this.showModal = true;
      };
    } else {
      alert('No hay unidades detectadas para esta planta.');
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPlanta = null;
    this.imageWidth = 0;
    this.imageHeight = 0;
  }

  getPoints(polygon: number[][]): string {
    return polygon.map(point => point.join(',')).join(' ');
  }

  // Método para eliminar planta (opcional)
  eliminarPlanta(plantaId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta planta?')) {
      // Aquí llamarías al servicio para eliminar
      // this.proyectosService.eliminarPlanta(plantaId)
      console.log('Eliminar planta:', plantaId);
    }
  }

  trackByPlantaId(index: number, planta: ExtendedPlanta): number {
  return planta.id;
}
}

