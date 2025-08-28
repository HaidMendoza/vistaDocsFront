import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private apiUrl = 'https://vistadoc-backend.onrender.com'
  constructor(private http: HttpClient) {}

  createUnit(unitData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/units/create`, unitData);
  }

  // Subir documento PDF
  uploadDocument(file: File, name: string, unitId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('unitId', unitId.toString());

    return this.http.post(`${this.apiUrl}/documents/upload`, formData);
  }

    uploadMultipleDocuments(files: File[], unitId: number): Observable<any[]> {
    const requests = files.map((file) => {
      return this.uploadDocument(file, file.name, unitId);
    });

    return forkJoin(requests);
  }

   listarPorUnidad(unitId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/documents/by-unit/${unitId}`);
  }
}
