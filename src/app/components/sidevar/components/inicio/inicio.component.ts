import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProyectosService } from '../../../../services/proyectos.service';
import { Proyecto } from '../../../../models/proyecto';
import { ModalCrearProyectoComponent } from './shared/modal-crear-proyecto/modal-crear-proyecto.component';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
  proyectos: Proyecto[] = []; // Se especifica el tipo de dato para 'proyectos'
  isLoading = true; // Agregamos una variable para manejar el estado de carga
  error: string | null = null; // Agregamos una variable para manejar errores

  constructor(private proyectosService: ProyectosService) {}

  ngOnInit(): void {
    // Suscribirse al observable de autenticación para asegurar que el token está disponible
    // antes de intentar obtener los proyectos. Esto previene el error 401 Unauthorized.
    this.proyectosService.isAuthenticated.subscribe(isAuth => {
      if (isAuth) {
        // Si el usuario está autenticado, llamar al método para obtener los proyectos.
        this.obtenerProyectos();
      } else {
        // Manejar el caso en que el usuario no está autenticado.
        this.proyectos = [];
        this.isLoading = false;
        this.error = 'No estás autenticado. Por favor, inicia sesión.';
      }
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
    document.body.style.overflow = 'hidden'; // Bloquea el scroll de la página
  }

  alCerrarModal(estado: boolean): void {
    this.mostrarModal = estado;
    document.body.style.overflow = ''; // Restaura el scroll
    // Si el modal se cierra (estado es falso), volvemos a obtener la lista de proyectos.
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
        this.isLoading = false;
        console.log('Proyectos obtenidos con éxito:', this.proyectos);
      }),
      catchError(error => {
        this.error = 'Error al obtener los proyectos. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
        console.error('Error al obtener los proyectos:', error);
        return throwError(() => new Error('No se pudieron obtener los proyectos.'));
      })
    ).subscribe();
  }
}
