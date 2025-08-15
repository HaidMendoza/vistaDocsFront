import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

/**
 * Interfaz para la respuesta de autenticación que contiene el token JWT.
 */
export interface AuthResponse {
  token: string;
}

/**
 * Interfaz para los datos de inicio de sesión.
 */
export interface Login {
  email: string;
  password: string;
}

/**
 * Interfaz para los datos de registro de usuario.
 */
export interface Registro {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  password: string;
  companyName: string;
  // Vuelve a agregar estos campos
  role: string;
  phone: string;
}
@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private apiUrl = 'https://vistadoc-backend.onrender.com/auth';

  constructor(private http: HttpClient) { }

 
  registrarUsuario(registro: Registro): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registro).pipe(
      tap(response => {
       
        localStorage.setItem('auth_token', response.token);
      })
    );
  }

  
  iniciarSesion(login: Login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, login).pipe(
      tap(response => {
        
        localStorage.setItem('auth_token', response.token);
      })
    );
  }
}