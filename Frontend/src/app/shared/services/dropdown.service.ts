
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CommonSearchService } from '../../pages/all-dashboard/payroll/services/common-search.service';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private locationCache: any[] | null = null;
  private departmentCache: any[] | null = null;
  private designationCache: any[] | null = null;
  private postingCityCache: any[] | null = null;
  private natureCache: any[] | null = null;

  // Subjects to notify components of refresh events
  private locationReloadSubject = new Subject<void>();
  private departmentReloadSubject = new Subject<void>();

  // Observables for components to subscribe to
  locationReloadObservable$ = this.locationReloadSubject.asObservable();
  departmentReloadObservable$ = this.departmentReloadSubject.asObservable();

  constructor(private commonSearchService: CommonSearchService) {}

  // ------------------ GETTERS WITH CACHE -------------------

  getLocations(): Observable<any[]> {
    if (this.locationCache) return of(this.locationCache);
    return this.fetchLocationsFromApi();
  }

  getDepartments(): Observable<any[]> {
    if (this.departmentCache) return of(this.departmentCache);
    return this.fetchDepartmentsFromApi();
  }

  getDesignations(): Observable<any[]> {
    if (this.designationCache) return of(this.designationCache);
    return this.commonSearchService.getCommonDdl('Designation').pipe(
      map(res => (res?.data ?? []).filter((item: { value: null; }) => item.value !== null)),
      tap(data => this.designationCache = data),
      catchError(err => {
        console.error('Error fetching designations', err);
        return of([]);
      })
    );
  }

  getPostingCities(): Observable<any[]> {
    if (this.postingCityCache) return of(this.postingCityCache);
    return this.commonSearchService.getCommonDdl('City').pipe(
      map(res => (res?.data ?? []).filter((item: { value: null; }) => item.value !== null)),
      tap(data => this.postingCityCache = data),
      catchError(err => {
        console.error('Error fetching cities', err);
        return of([]);
      })
    );
  }

  getNature(): Observable<any[]> {
    if (this.natureCache) return of(this.natureCache);
    return this.commonSearchService.getCommonDdl('Nature').pipe(
      map(res => (res?.data ?? []).filter((item: { value: null; }) => item.value !== null)),
      tap(data => this.natureCache = data),
      catchError(err => {
        console.error('Error fetching nature', err);
        return of([]);
      })
    );
  }

  // ------------------ REFRESH METHODS -------------------

  refreshLocations(): Observable<any[]> {
    this.locationCache = null;
    return this.fetchLocationsFromApi();
  }

  refreshDepartments(): Observable<any[]> {
    this.departmentCache = null;
    return this.fetchDepartmentsFromApi();
  }

  triggerLocationReload() {
    this.locationReloadSubject.next();
  }

  triggerDepartmentReload() {
    this.departmentReloadSubject.next();
  }

  clearCache() {
    this.locationCache = null;
    this.departmentCache = null;
    this.designationCache = null;
    this.postingCityCache = null;
    this.natureCache = null;
  }

  // ------------------ PRIVATE HELPERS -------------------

  private fetchLocationsFromApi(): Observable<any[]> {
    return this.commonSearchService.getLocationdl().pipe(
      map(res => (res?.data ?? []).filter((item: { value: null; }) => item.value !== null)),
      tap(data => this.locationCache = data),
      catchError(err => {
        console.error('Error fetching locations', err);
        return of([]);
      })
    );
  }

  private fetchDepartmentsFromApi(): Observable<any[]> {
    return this.commonSearchService.getCommonDdl('Department').pipe(
      map(res => (res?.data ?? []).filter((item: { value: null; }) => item.value !== null)),
      tap(data => this.departmentCache = data),
      catchError(err => {
        console.error('Error fetching departments', err);
        return of([]);
      })
    );
  }
}



