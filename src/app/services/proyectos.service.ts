import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// DTO de planta
export interface CrearPlantaDTO {
  name: string;
  level: number;
  projectId: number;
  floorPlanUrl?: string;
}

export interface Planta {
  id: number;
  name: string;
  level: number;
  floorPlanUrl: string;
  projectId: number;
}

// DTO de compañía
export interface CrearCompaniaDTO {
  name: string;
  nit: string;
  address: string;
  city: string;
  phone: string;
}

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

// DTO de proyecto
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
  private apiUrlget = 'https://vistadoc-backend.onrender.com/projects/by-company/1'; // Endpoint público para GET

  constructor(private http: HttpClient) {}

  // --- PROYECTOS ---
  crearProyecto(proyectoData: FormData): Observable<Proyecto> {
    return this.http.post<Proyecto>(`${this.apiUrl}/create`, proyectoData);
  }

  obtenerProyectos(): Observable<Proyecto[]> {
    // 👇 Usamos un endpoint público
    return this.http.get<Proyecto[]>(this.apiUrlget);
  }

  actualizarProyecto(id: string, proyecto: Proyecto): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}`, proyecto);
  }

  eliminarProyecto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- PLANTAS ---
  crearPlanta(plantaData: FormData): Observable<Planta> {
    return this.http.post<Planta>(`${this.plantsApiUrl}/create`, plantaData);
  }

  obtenerPlantasPorProyecto(projectId: number): Observable<Planta[]> {
    return this.http.get<Planta[]>(`${this.plantsApiUrl}/by-project/${projectId}`);
  }

  detectarUnidadesEnPlano(plantaId: number): Observable<any> {
    return this.http.post(`${this.plantsApiUrl}/${plantaId}/detect-units`, {});
  }

  // --- COMPAÑÍAS ---
  crearCompania(companiaData: CrearCompaniaDTO): Observable<Compania> {
    return this.http.post<Compania>(`${this.companiesApiUrl}/create`, companiaData);
  }

  obtenerCompanias(): Observable<Compania[]> {
    return this.http.get<Compania[]>(`${this.companiesApiUrl}/all`);
  }
}
