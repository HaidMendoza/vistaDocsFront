import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PersonaService, Registro } from '../../../services/persona.service';
import { ProyectosService, Compania } from '../../../services/proyectos.service'; // Importa ProyectosService y la interfaz Compania
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent implements OnInit {

  registroForm!: FormGroup;
  public companias: Compania[] = []; // Propiedad para almacenar las compañías

  constructor(
    private fb: FormBuilder,
    private personaService: PersonaService,
    private proyectosService: ProyectosService, // Inyecta ProyectosService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      documentType: ['', Validators.required],
      documentNumber: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      phone: ['', Validators.required],
    });

    // Llama al servicio para obtener la lista de compañías
    this.proyectosService.obtenerCompanias().subscribe({
      next: (data) => {
        this.companias = data;
        console.log('Compañías cargadas:', this.companias);
      },
      error: (error) => {
        console.error('Error al cargar las compañías:', error);
      }
    });
  }

  registrar(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    // Se extraen todos los campos, incluyendo 'role' y 'phone'
    const registroData: Registro = this.registroForm.value;
    console.log('Datos de registro:', registroData);

    this.personaService.registrarUsuario(registroData).pipe(
      tap(response => {
        console.log('Registro exitoso y token guardado:', response);
        this.router.navigate(['/']);
      }),
      catchError(error => {
        console.error('Error durante el registro:', error);
        return throwError(() => new Error('Error en el registro. Inténtalo de nuevo.'));
      })
    ).subscribe();
  }
}
