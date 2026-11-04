import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

// =======================================================================
// INTERFACES
// =======================================================================

/**
 * Standard response wrapper from the API.
 */
export interface ModelResponse<T = any> {
  isSuccess: boolean;
  message: string;
  data: T;
  statusCode: number;
}

/**
 * Defines a field that has been included in a report, with all its properties.
 * This is the single source of truth for an included field's structure.
 */
export interface ReportFieldInfo {
  fieldName: string;
  tableName: string;
  columnName: string;
  orderIndex: number;
  isFilter: boolean;
  dataType: string;
  alias: string; // Added for editable display names
}

/**
 * Defines a raw field available in the database.
 */
export interface FieldDefinition {
  fieldName: string;
  tableName: string;
  columnName: string;
  description: string;
  dataType: string;
}

/**
 * Simplified object for creating a new report.
 */
export interface CreateReportRequest {
  reportName: string;
}

/**
 * Interface for the database schema response.
 */
export interface SchemaData {
  tablename: string;
  fields: string[];
}

/**
 * Interface for updating available fields for a report.
 */
export interface UpdateAvailableFieldsRequest {
  tableName: string;
  columnName: string;
}


@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.baseURL1}${environment.ReportBuilder }`;
  //private apiUrl = 'https://localhost:7142/api/ReportBuilder';

  constructor(private http: HttpClient) { }

  // ===========================================
  // SCHEMA & FIELD DEFINITION METHODS
  // ===========================================

  /**
   * Gets the complete database schema.
   */
  getDatabaseSchema(): Observable<ModelResponse<SchemaData[]>> {
    return this.http.get<ModelResponse<SchemaData[]>>(`${this.apiUrl}/schema`);
  }

  /**
   * Gets all available field definitions from the backend.
   */
  getFieldDefinitions(): Observable<ModelResponse<FieldDefinition[]>> {
    return this.http.get<ModelResponse<FieldDefinition[]>>(`${this.apiUrl}/fields`);
  }

  // ===========================================
  // REPORT MANAGEMENT METHODS
  // ===========================================

  /**
   * Gets the list of all available report names.
   */
  getReportList(): Observable<ModelResponse<string[]>> {
    return this.http.get<ModelResponse<string[]>>(`${this.apiUrl}`);
  }

  /**
   * Creates a new report.
   */
  createReport(reportName: string): Observable<ModelResponse> {
    const request: CreateReportRequest = { reportName };
    return this.http.post<ModelResponse>(`${this.apiUrl}/reports`, request);
  }

  /**
   * Deletes a report.
   */
  deleteReport(reportName: string): Observable<ModelResponse> {
    return this.http.delete<ModelResponse>(`${this.apiUrl}/${reportName}`);
  }

  // ===========================================
  // REPORT CONFIGURATION METHODS
  // ===========================================

  /**
   * Gets the fields configured as "Available" for a specific report.
   */
  getAvailableFieldsForReport(reportName: string): Observable<ModelResponse<FieldDefinition[]>> {
    return this.http.get<ModelResponse<FieldDefinition[]>>(`${this.apiUrl}/${reportName}/available-fields`);
  }

  /**
   * Updates the available fields for a report.
   */
  updateAvailableFieldsForReport(
    reportName: string, 
    fields: UpdateAvailableFieldsRequest[]
  ): Observable<ModelResponse> {
    return this.http.put<ModelResponse>(`${this.apiUrl}/${reportName}/available-fields`, fields);
  }

  /**
   * Gets the fields included in a specific report.
   */
  getIncludedFieldsForReport(reportName: string): Observable<ModelResponse<ReportFieldInfo[]>> {
    return this.http.get<ModelResponse<ReportFieldInfo[]>>(`${this.apiUrl}/${reportName}/included-fields`);
  }

  /**
   * Updates the fields included in a report.
   */
  updateIncludedFieldsForReport(reportName: string, fields: ReportFieldInfo[]): Observable<ModelResponse> {
    return this.http.put<ModelResponse>(`${this.apiUrl}/${reportName}/included-fields`, fields);
  }

  /**
   * Gets the fields marked as filterable for a specific report.
   */
  

  /**
   * Gets the distinct values for a given table and column to populate filter dropdowns.
   */


  // ===========================================
  // REPORT DOWNLOAD METHOD
  // ===========================================

  /**
   * Downloads a report, optionally applying a set of filters.
   * Using POST is better for complex filter objects that might exceed URL length limits.
   */
  downloadReport(reportName: string, filters?: any[]): Observable<Blob> {
  const url = `${this.apiUrl}/${reportName}/download`;
  // For a POST request, the data (filters array) is passed as the second argument.
  return this.http.post(url, filters || [], { 
    responseType: 'blob' 
  });
}
getFilterableFieldsForReport(reportName: string): Observable<ModelResponse<ReportFieldInfo[]>> {
    return this.http.get<ModelResponse<ReportFieldInfo[]>>(`${this.apiUrl}/${reportName}/filterable-fields`);
  }

  getDistinctFieldValues(tableName: string, columnName: string): Observable<ModelResponse<string[]>> {
    return this.http.get<ModelResponse<string[]>>(`${this.apiUrl}/filter-options/${tableName}/${columnName}`);
  }
}
