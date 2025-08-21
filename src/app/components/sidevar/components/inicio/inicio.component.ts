import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProyectosService, Proyecto } from '../../../../services/proyectos.service';
import { ModalCrearProyectoComponent } from './shared/modal-crear-proyecto/modal-crear-proyecto.component';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ModalCrearProyectoComponent
  ],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

  mostrarModal = false;
  proyectos: Proyecto[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private proyectosService: ProyectosService) {}

  ngOnInit(): void {
    this.obtenerProyectos();
  }

  abrirModal(): void {
    this.mostrarModal = true;
    document.body.style.overflow = 'hidden';
  }

  alCerrarModal(estado: boolean): void {
    this.mostrarModal = estado;
    document.body.style.overflow = '';
    if (!estado) {
      this.obtenerProyectos();
    }
  }

  obtenerProyectos(): void {
    this.isLoading = true;
    this.error = null;

    this.proyectosService.obtenerProyectos().pipe(
      tap((data: Proyecto[]) => {
        this.proyectos = data;
        console.log('✅ Proyectos obtenidos con éxito:', this.proyectos);
      }),
      catchError(error => {
        this.error = '❌ Error al obtener los proyectos. Por favor, inténtalo de nuevo más tarde.';
        console.error('Error al obtener los proyectos:', error);
        return of([]); // 🔥 devuelve array vacío para que no se quede cargando
      })
    ).subscribe(() => {
      this.isLoading = false; 
    });
  }
}
