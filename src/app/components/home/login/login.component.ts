import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PersonaService,Login } from '../../../services/persona.service';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink, 
    RouterLinkActive,
    ReactiveFormsModule, 
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  // Declaración del formulario reactivo
  loginForm!: FormGroup;

  // Inyección de dependencias
  constructor(
    private fb: FormBuilder,
    private personaService: PersonaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicialización del formulario en el ciclo de vida del componente
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Campo para el correo electrónico con validadores de "required" y "email"
      password: ['', Validators.required], // Campo para la contraseña con validador de "required"
    });
  }

  // Método que se ejecuta al enviar el formulario
  iniciarSesion(): void {
    // Verificar si el formulario es inválido
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marcar todos los campos como tocados para mostrar los mensajes de error
      return;
    }

    // Obtener los datos del formulario
    const loginData: Login = this.loginForm.value;

    // Llamar al servicio para iniciar sesión
    this.personaService.iniciarSesion(loginData).pipe(
      tap(response => {
        // Lógica en caso de éxito
        console.log('Inicio de sesión exitoso:', response);
       
        this.router.navigate(['/sidevar']);
      }),
      catchError(error => {
        // Lógica en caso de error
        console.error('Error durante el inicio de sesión:', error);
        // Devolver un error para que no se caiga el flujo de la aplicación
        return throwError(() => new Error('Credenciales incorrectas. Inténtalo de nuevo.'));
      })
    ).subscribe(); 
  }
}
