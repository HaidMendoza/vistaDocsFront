import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';


// Interfaz para el DTO de crear una planta
export interface CrearPlantaDTO {
  name: string;
  level: number;
  projectId: number;
  floorPlanUrl?: string;
}

// Interfaz para la respuesta de una planta
export interface Planta {
  id: number;
  name: string;
  level: number;
  floorPlanUrl: string;
  projectId: number;
}

// Interfaz para la respuesta de una compañía
export interface Compania {
    id: number;
    name: string;
    slug: string;
    nit: string;
    address: string;
    city: string;
    phone: string;
    logoUrl: string;
    schema: string;
}

// Interfaz para el DTO de crear una compañía
export interface CrearCompaniaDTO {
    name: string;
    nit: string;
    address: string;
    city: string;
    phone: string;
}

// Interfaces de autenticación (LoginData, LoginResponse)
export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// Interfaz del proyecto, como el backend lo espera
export interface Proyecto {
  id?: string;
  name: string;
  address: string;
  description: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {
  private apiUrl = 'https://vistadoc-backend.onrender.com/projects';
  private plantsApiUrl = 'https://vistadoc-backend.onrender.com/plants';
  private companiesApiUrl = 'https://vistadoc-backend.onrender.com/companies';

  // URL y propiedades para la autenticación
  private authUrl = 'https://vistadoc-backend.onrender.com/auth';
  private authToken = new BehaviorSubject<string | null>(null);
  public isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  // --- LÓGICA DE AUTENTICACIÓN ---

  // Carga el token del localStorage al inicializar el servicio
  private loadToken(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.authToken.next(token);
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  // Método para iniciar sesión y guardar el token
  login(loginData: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, loginData).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          this.authToken.next(response.token);
          this.isAuthenticated.next(true);
        }
      }),
      catchError(error => {
        console.error('Error durante el inicio de sesión:', error);
        this.isAuthenticated.next(false);
        return throwError(() => new Error('Error en el inicio de sesión.'));
      })
    );
  }

  // Obtiene el token actual para enviarlo en las cabeceras
  getToken(): string | null {
    return this.authToken.getValue();
  }

  // Devuelve los HttpHeaders con el token de autorización
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }

  // Cierra la sesión y remueve el token
  logout(): void {
    localStorage.removeItem('auth_token');
    this.authToken.next(null);
    this.isAuthenticated.next(false);
  }

  // --- MÉTODOS DE PROYECTOS, PLANTAS Y COMPAÑÍAS ---

  crearProyecto(proyectoData: FormData): Observable<Proyecto> {
    const headers = this.getAuthHeaders();
    return this.http.post<Proyecto>(`${this.apiUrl}/create`, proyectoData, { headers });
  }

  obtenerProyectos(): Observable<Proyecto[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Proyecto[]>(`${this.apiUrl}/my-projects`, { headers });
  }

  actualizarProyecto(id: string, proyecto: Proyecto): Observable<Proyecto> {
    const headers = this.getAuthHeaders();
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}`, proyecto, { headers });
  }

  eliminarProyecto(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  crearPlanta(plantaData: FormData): Observable<Planta> {
    const headers = this.getAuthHeaders();
    return this.http.post<Planta>(`${this.plantsApiUrl}/create`, plantaData, { headers });
  }

  obtenerPlantasPorProyecto(projectId: number): Observable<Planta[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Planta[]>(`${this.plantsApiUrl}/by-project/${projectId}`, { headers });
  }

  detectarUnidadesEnPlano(plantaId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.plantsApiUrl}/${plantaId}/detect-units`, {}, { headers });
  }

  crearCompania(companiaData: CrearCompaniaDTO): Observable<Compania> {
    const headers = this.getAuthHeaders();
    return this.http.post<Compania>(`${this.companiesApiUrl}/create`, companiaData, { headers });
  }

  obtenerCompanias(): Observable<Compania[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Compania[]>(`${this.companiesApiUrl}/all`, { headers });
  }
}