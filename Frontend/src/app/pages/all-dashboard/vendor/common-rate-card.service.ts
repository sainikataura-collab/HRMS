import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CommonRateCardService {

  constructor(private http: HttpClient) { }

  // Insert Common Rate Card
  insert(data: any): Observable<any> {
    const url = `${environment.baseURL1}/CommonRateCard/Insert`;
    return this.http.post<any>(url, data);
  }

  // Update Common Rate Card
  update(data: any): Observable<any> {
    const url = `${environment.baseURL1}/CommonRateCard/Update`;
    return this.http.put<any>(url, data);
  }

  // Delete Common Rate Card
  delete(id: number | string): Observable<any> {
    const url = `${environment.baseURL1}/CommonRateCard/${id}`;
    return this.http.delete<any>(url);
  }

  // Get Common Rate Card by ID
  getById(id: number | string): Observable<any> {
    const url = `${environment.baseURL1}/CommonRateCard/${id}`;
    return this.http.get<any>(url);
  }

  // Get All Common Rate Cards (Grid with Pagination & Search)
  getAll(
    pageIndex: number = 0,
    pageSize: number = 10,
    searchTerm: string = ''
  ): Observable<any> {
    let url = `${environment.baseURL1}/CommonRateCard/GetAll?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.http.get<any>(url);
  }

  // Check if Rate Card exists by Combination (Client, Model, Location, EffectiveFrom, FHR ID)
  
  checkExists(
    clientId: number | string,
    modelId: number | string,
    locationId: string,
    effectiveFrom: string,
    fhrId: string,
    largeVehicleTypeId?: number | string | null,
    amazonEdspVehicleTypeId?: number | string | null
  ): Observable<any> {
    let url = `${environment.baseURL1}/CommonRateCard/CheckExists?clientId=${clientId}&modelId=${modelId}&locationId=${encodeURIComponent(locationId)}&effectiveFrom=${encodeURIComponent(effectiveFrom)}&fhrId=${encodeURIComponent(fhrId)}`;
    if (largeVehicleTypeId) url += `&largeVehicleTypeId=${largeVehicleTypeId}`;
    if (amazonEdspVehicleTypeId) url += `&amazonEdspVehicleTypeId=${amazonEdspVehicleTypeId}`;
    return this.http.get<any>(url);
  }

  // Get Vehicle Types (CodeTypeId = 8) from General Master
  getVehicleTypes(): Observable<any> {
    const url = `${environment.baseURL1}/General/GetDdlListBasedOnCodeType?codeTypeId=8`;
    return this.http.get<any>(url);
  }
}
