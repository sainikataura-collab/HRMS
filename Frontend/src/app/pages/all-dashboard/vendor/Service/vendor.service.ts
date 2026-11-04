import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  constructor(private http: HttpClient) { }

    getHiDashboardSummary(): Observable<any> {
    // Example (apne getVendorDashboardSummary wali line copy karke endpoint badlo):
    const url = `${environment.baseURL1}${environment.vendor.GetHIDashboardSummary}`;
    return this.http.get<any>(url);
  }

  // Get Agent Dropdown List
  getAgentDropdown(): Observable<any> {
    const url = `${environment.baseURL1}${(environment as any).vendor.GetVendorAgentDropdown}`;
    return this.http.get<any>(url);
  }

  // downloadVendorVerificationExcel(searchTerm: string = ''): Observable<Blob> {
  //   const url = `${environment.baseURL1}${environment.vendor.DownloadVendorVerificationExcel}?searchTerm=${encodeURIComponent(searchTerm)}`;
  //   return this.http.get(url, { responseType: 'blob' });
  // }
  downloadVendorVerificationExcel(searchTerm: string = '', locationId: string = ''): Observable<Blob> {
    const url = `${environment.baseURL1}${environment.vendor.DownloadVendorVerificationExcel}?searchTerm=${encodeURIComponent(searchTerm)}&locationId=${encodeURIComponent(locationId)}`;
    return this.http.get(url, { responseType: 'blob' });
  }

   getVendorDownloadVerificationList(pageIndex: number = 1, pageSize: number = 10, searchTerm: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.GetVendorDownloadVerificationList}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.http.get<any>(url);
  }


  getVendorList(pageIndex: number = 0, pageSize: number = 100): Observable<any> {
    const url = `${environment.baseURL1}/Vendor/GetAll?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  //by aryan and rupesh

  uploadVendorExcel(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.UploadVendorExcel}`;
    return this.http.post<any>(url, formData);
  }
  
  // Get All Vendors with pagination and optional search
  // getAllVendors(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
  //   const url = `${environment.baseURL1}${(environment as any).vendor.VendorList}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
  //   return this.http.get<any>(url);
  // }

  // Get All Vendors with pagination and optional search
  // getAllVendors(pageIndex: number, pageSize: number, searchTerm: string = '', locationId: string = '', agentCode: string = '', status: string = ''): Observable<any> {
  //   const url = `${environment.baseURL1}${(environment as any).vendor.VendorList}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}&locationId=${encodeURIComponent(locationId)}&agentCode=${encodeURIComponent(agentCode)}&status=${encodeURIComponent(status)}`;
  //   return this.http.get<any>(url);
  // }

   // Get All Vendors with pagination and optional search
  getAllVendors(pageIndex: number, pageSize: number, searchTerm: string = '', locationId: string = '', agentCode: string = '', status: string = '', fhridMappingStatus: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${(environment as any).vendor.VendorList}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}&locationId=${encodeURIComponent(locationId)}&agentCode=${encodeURIComponent(agentCode)}&status=${encodeURIComponent(status)}&fhridMappingStatus=${encodeURIComponent(fhridMappingStatus)}`;
    return this.http.get<any>(url);
  }


  // Get Vendor by ID
  getVendorById(pk_recId: string): Observable<any> {
    const url = `${environment.baseURL1}${(environment as any).vendor.GetVendorById}/${pk_recId}`;
    return this.http.get<any>(url);
  }

  // Create new Vendor
  insertVendor(vendor: any): Observable<any> {
    const url = `${environment.baseURL1}${(environment as any).vendor.InsertVendor}`;
    return this.http.post<any>(url, vendor);
  }

  // Update existing Vendor
  updateVendor(vendor: any): Observable<any> {
    const url = `${environment.baseURL1}${(environment as any).vendor.UpdateVendor}`;
    return this.http.post<any>(url, vendor);
  }

  // Delete Vendor
  deleteVendor(pk_recId: string): Observable<any> {
    const url = `${environment.baseURL1}${(environment as any).vendor.DeleteVendor}/${pk_recId}`;
    return this.http.delete<any>(url);
  }

  // Get Vendor Audit Logs
  getVendorAuditLogs(pk_recId: string): Observable<any> {
    const url = `${environment.baseURL1}${(environment as any).vendor.GetVendorAuditLogs}/${pk_recId}`;
    return this.http.get<any>(url);
  }

  // Fetch dropdown list using General NameValueMapping API
  getDropdownList(fieldName: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get<any>(url);
  }

  // Fetch city list based on State ID
  getCitiesByState(stateId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CitybyStateList}/${stateId}`;
    return this.http.get<any>(url);
  }

  // Fetch dropdown list based on code type ID
  getDdlListBasedOnCodeType(codeTypeId: string, organizationId: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.GetDdlListBasedOnCodeType}?codeTypeId=${codeTypeId}&organizationId=${organizationId}`;
    return this.http.get<any>(url);
  }
  
// Get Vendor Dashboard Summary Metrics
  getVendorDashboardSummary(monthId: string = '', yearId: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.GetVendorDashboardSummary}?monthId=${monthId}&yearId=${yearId}`;
    return this.http.get<any>(url);
  }

   // Vendor Excel Document Upload & Management
  saveVendorExcelDoc(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.SaveExcelDocument}`;
    return this.http.post<any>(url, formData);
  }

  getVendorExcelDocList(pageIndex: number = 1, pageSize: number = 10, searchTerm: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.GetVendorMasterUploadDocumentList}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.http.get<any>(url);
  }

  downloadVendorExcelDoc(id: number): Observable<Blob> {
    const url = `${environment.baseURL1}${environment.vendor.DownloadVendorMasterDocument}/${id}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  // Get Models by Client ID
  getModelListByClient(clientId: number | string): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.GetModelListByClient}/${clientId}`;
    return this.http.get<any>(url);
  }

  // Get Vendor Rate Card Audit History
  getVendorRateCardHistory(pk_recId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.GetVendorRateCardHistory}/${pk_recId}`;
    return this.http.get<any>(url);
  }

  // Get Active Vendor Rate Cards by Vendor ID (Tab 2)
  getVendorRateCards(pk_recId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.GetVendorRateCards}/${pk_recId}`;
    return this.http.get<any>(url);
  }


  uploadRateCard(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${(environment as any).vendor.UploadRateCard}`;
    return this.http.post<any>(url, formData);
  }

  
  rateCardExcelUpload(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}/Vendor/RateCardExcelUpload`;
    return this.http.post<any>(url, formData);
  }

  transactionExcelUpload(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}/Vendor/TransactionExcelUpload`;
    return this.http.post<any>(url, formData);
  }
  getAuditLogDocumentNames(): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.GetAuditLogDocumentNames}`;
    return this.http.get<any>(url);
  }

  getAuditLogs(filter: { DocumentName?: string | null; DocumentCode?: string | null; FromDate?: string | null; ToDate?: string | null }): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.GetAuditLogs}`;
    return this.http.post<any>(url, filter);
  }

   // Get Historic FHRIDs from Vendor_FHRID_RateCards (Tab 2 and 3 for Update mode)
  getVendorFHRIDHistory(pk_recId: string, pageIndex: number = 1, pageSize: number = 10): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.getVendorFHRIDHistory}${pk_recId}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  // Get Linked FHR IDs
  getLinkedFHRIDs(clientId: string, modelId: string): Observable<any> {
    const url = `${environment.baseURL1}${(environment as any).vendor.GetLinkedFHRIDs}?clientId=${clientId}&modelId=${modelId}`;
    return this.http.get<any>(url);
  }


  //added code 31 aug2026 starts
  uploadVendorFHRIDMappingExcel(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.UploadVendorFHRIDMappingExcel}`;
    return this.http.post<any>(url, formData);
  }

  // Get Uploaded FHR ID Mapping Files (for Fact Box)
  getVendorFHRIDFiles(): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.GetVendorFHRIDFiles}`;
    return this.http.get<any>(url);
  }

  // Download Uploaded FHR ID Mapping File
  downloadVendorFHRIDFile(id: number): Observable<Blob> {
    const url = `${environment.baseURL1}/Vendor/DownloadVendorFHRIDFile/${id}`;
    return this.http.get(url, { responseType: 'blob' });
  }
  
  // Transaction Upload Fact Box APIs
  getTransactionUploadedFiles(): Observable<any> {
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetTransactionUploadedFiles`);
  }

  downloadTransactionFile(id: number): Observable<Blob> {
    return this.http.get(environment.baseURL1 + '/Vendor/DownloadTransactionFile/' + id, {
      responseType: 'blob'
    });
  }

  exportTransactionList(clientId: number, modelId: number, locationId: string, transactionRange: string, vendorCode: string, searchTerm: string): Observable<Blob> {
    const url = environment.baseURL1 + '/Vendor/TransactionList/Export?clientId=' + clientId + '&modelId=' + modelId + '&locationId=' + locationId + '&transactionRange=' + transactionRange + '&vendorCode=' + vendorCode + '&searchTerm=' + searchTerm;
    return this.http.get(url, { responseType: 'blob' });
  }

getRateCardUploadedFiles(): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.GetRateCardUploadedFiles}`;
    return this.http.get<any>(url);
  }

  // Download Uploaded Rate Card File
  downloadRateCardFile(id: number): Observable<Blob> {
    const url = `${environment.baseURL1}${environment.vendor.DownloadRateCardFile}/${id}`;
    return this.http.get(url, { responseType: 'blob' });
  }
  //added code 31 aug 2026 ends

     getMappedVendorCount(): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.GetVendorFHRIDMappingStats}`;
    return this.http.get<any>(url);
  }

  getVendorMappedUnmappedList(isMapped: boolean): Observable<any> {
    const url = `${environment.baseURL1}${(environment as any).vendor.GetVendorMappedUnmappedList}?isMapped=${isMapped}`;
    return this.http.get<any>(url);
  }



  getVendorTransactionRanges(clientId: number, modelId: number): Observable<any> {
    return this.http.get<any>(environment.baseURL1 + environment.vendor.GetVendorTransactionRanges + '?clientId=' + clientId + '&modelId=' + modelId);
  }

  searchVendors(searchTerm: string): Observable<any> {
    return this.http.get<any>(environment.baseURL1 + environment.vendor.SearchVendors + '?searchTerm=' + searchTerm);
  }

    getVendorTemplateData(clientId: number, modelId: number): Observable<any> {
    return this.http.get<any>(environment.baseURL1 + '/Vendor/TransactionTemplateData?clientId=' + clientId + '&modelId=' + modelId);
  }

  downloadTransactionTemplate(clientId: number, modelId: number): Observable<Blob> {
    return this.http.get(environment.baseURL1 + '/Vendor/DownloadTransactionTemplate?clientId=' + clientId + '&modelId=' + modelId, {
      responseType: 'blob'
    });
  }

  getVendorTransactionList(clientId: number, modelId: number, locationId: string, transactionRange: string, vendorCode: string, searchTerm: string, pageIndex: number, pageSize: number): Observable<any> {
    const params = `?clientId=${clientId}&modelId=${modelId}&locationId=${locationId || ''}&transactionRange=${transactionRange || ''}&vendorCode=${vendorCode || ''}&searchTerm=${searchTerm || ''}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(environment.baseURL1 + environment.vendor.GetVendorTransactionList + params);
  }

  // Dynamic Deduction Entry, Fact Box, Sync & Recovery MIS Services
  getLinkedLocations(clientId: number, modelId: number): Observable<any> {
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetLinkedLocations?clientId=${clientId}&modelId=${modelId}`);
  }

  getLinkedVendors(clientId: number, modelId: number, locationId?: string): Observable<any> {
    const loc = locationId ? `&locationId=${encodeURIComponent(locationId)}` : '';
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetLinkedVendors?clientId=${clientId}&modelId=${modelId}${loc}`);
  }

  saveDeductionEntries(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/SaveDeductionEntries`, payload);
  }

  saveMultiVendorDeductionBatch(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/SaveMultiVendorDeductionBatch`, payload);
  }

  downloadDeductionExcelTemplate(clientId: number, modelId: number, fromDate: string, toDate: string, locationId?: string, clientName?: string, modelName?: string): Observable<Blob> {
    const loc = locationId ? `&locationId=${encodeURIComponent(locationId)}` : '';
    const cName = clientName ? `&clientName=${encodeURIComponent(clientName)}` : '';
    const mName = modelName ? `&modelName=${encodeURIComponent(modelName)}` : '';
    return this.http.get(`${environment.baseURL1}/Vendor/DownloadDeductionExcelTemplate?clientId=${clientId}&modelId=${modelId}&fromDate=${fromDate}&toDate=${toDate}${loc}${cName}${mName}`, { responseType: 'blob' });
  }

  uploadDeductionExcel(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/UploadDeductionExcel`, formData);
  }

  getDeductionUploadedFiles(): Observable<any> {
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetDeductionUploadedFiles`);
  }

  downloadDeductionUploadedFile(fileName: string): Observable<Blob> {
    return this.http.get(`${environment.baseURL1}/Vendor/DownloadDeductionUploadedFile?fileName=${encodeURIComponent(fileName)}`, { responseType: 'blob' });
  }

  getShipmentRecoverySummary(shipmentId: string, clientId?: number, modelId?: number): Observable<any> {
    const cParam = clientId ? `&clientId=${clientId}` : '';
    const mParam = modelId ? `&modelId=${modelId}` : '';
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetShipmentRecoverySummary?shipmentId=${encodeURIComponent(shipmentId)}${cParam}${mParam}`);
  }

  deleteDeductionEntry(entryId: number): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/DeleteDeductionEntry?entryId=${entryId}`, {});
  }

  // Get Vehicle Types (CodeTypeId = 8) from General Master
  getVehicleTypes(): Observable<any> {
    const url = `${environment.baseURL1}/General/GetDdlListBasedOnCodeType?codeTypeId=8`;
    return this.http.get<any>(url);
  }

  // Get Route / Block List (CodeTypeId = 7) from General Master
  getRouteBlocks(): Observable<any> {
    const url = `${environment.baseURL1}/General/GetDdlListBasedOnCodeType?codeTypeId=7`;
    return this.http.get<any>(url);
  }

  getFactBoxDeductionSummary(clientId: number, modelId: number, fhrid: string, fromDate: string, toDate: string, locationId?: string, vehicleType?: string, route?: string): Observable<any> {
    const loc = locationId ? `&locationId=${encodeURIComponent(locationId)}` : '';
    const vType = vehicleType ? `&vehicleType=${encodeURIComponent(vehicleType)}` : '';
    const rParam = route ? `&route=${encodeURIComponent(route)}` : '';
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetFactBoxSummary?clientId=${clientId}&modelId=${modelId}&fhrid=${encodeURIComponent(fhrid)}&fromDate=${fromDate}&toDate=${toDate}${loc}${vType}${rParam}`);
  }

  syncDeductions(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/SyncDeductions`, payload);
  }

  getDeductionBreakdown(transactionId: number, column?: string): Observable<any> {
    const colParam = column ? `&column=${encodeURIComponent(column)}` : '';
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetDeductionBreakdown?transactionId=${transactionId}${colParam}`);
  }

  getTransactionSyncList(
    clientId: number,
    modelId: number,
    transactionRange: string,
    locationId: string = '',
    vendorCode: string = '',
    searchTerm: string = '',
    pageIndex: number = 1,
    pageSize: number = 20
  ): Observable<any> {
    const params = `?clientId=${clientId}&modelId=${modelId}&transactionRange=${encodeURIComponent(transactionRange)}&locationId=${encodeURIComponent(locationId)}&vendorCode=${encodeURIComponent(vendorCode)}&searchTerm=${encodeURIComponent(searchTerm)}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(`${environment.baseURL1}/Vendor/TransactionSyncList${params}`);
  }

  syncVendorTransactions(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/SyncTransactions`, payload);
  }

  updateTransactionRecoveryPercent(transactionId: number, recoveryPercent: number): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/UpdateTransactionRecoveryPercent`, {
      transactionId,
      recoveryPercent
    });
  }


  getRecoveryMISReport(fromDate: string, toDate: string, clientId?: number, modelId?: number, locationId?: string, recoveryStatus: string = 'ALL'): Observable<any> {
    const c = clientId ? `&clientId=${clientId}` : '';
    const m = modelId ? `&modelId=${modelId}` : '';
    const l = locationId ? `&locationId=${encodeURIComponent(locationId)}` : '';
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetRecoveryMISReport?fromDate=${fromDate}&toDate=${toDate}&recoveryStatus=${recoveryStatus}${c}${m}${l}`);
  }

  exportRecoveryMISReport(fromDate: string, toDate: string, clientId?: number, modelId?: number, locationId?: string, recoveryStatus: string = 'ALL'): Observable<Blob> {
    const c = clientId ? `&clientId=${clientId}` : '';
    const m = modelId ? `&modelId=${modelId}` : '';
    const l = locationId ? `&locationId=${encodeURIComponent(locationId)}` : '';
    return this.http.post(`${environment.baseURL1}/Vendor/ExportRecoveryMISReport?fromDate=${fromDate}&toDate=${toDate}&recoveryStatus=${recoveryStatus}${c}${m}${l}`, {}, {
      responseType: 'blob'
    });
  }

  getRecoveryPolicy(clientId?: number | string | null, modelId?: number | string | null): Observable<any> {
    const c = clientId ? `&clientId=${clientId}` : '';
    const m = modelId ? `&modelId=${modelId}` : '';
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetRecoveryPolicy?_t=${Date.now()}${c}${m}`);
  }

  saveRecoveryPolicy(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/SaveRecoveryPolicy`, payload);
  }

  getRecoveryPolicyAuditLog(clientId?: number | string | null, modelId?: number | string | null): Observable<any> {
    const c = clientId ? `&clientId=${clientId}` : '';
    const m = modelId ? `&modelId=${modelId}` : '';
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetRecoveryPolicyAuditLog?_t=${Date.now()}${c}${m}`);
  }

  saveOpeningDeficit(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/SaveOpeningDeficit`, payload);
  }

  bulkUploadOpeningDeficit(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/BulkUploadOpeningDeficit`, formData);
  }

  downloadOpeningDeficitTemplate(): Observable<Blob> {
    return this.http.get(`${environment.baseURL1}/Vendor/DownloadOpeningDeficitTemplate`, { responseType: 'blob' });
  }

  getOpeningDeficitsList(clientId?: any, modelId?: any, locationId?: string, searchTerm?: string): Observable<any> {
    const params: string[] = [`_t=${Date.now()}`];
    if (clientId) params.push(`clientId=${clientId}`);
    if (modelId) params.push(`modelId=${modelId}`);
    if (locationId) params.push(`locationId=${encodeURIComponent(locationId)}`);
    if (searchTerm) params.push(`searchTerm=${encodeURIComponent(searchTerm)}`);
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetOpeningDeficitsList?${params.join('&')}`);
  }

  deleteOpeningDeficit(id: number | string): Observable<any> {
    return this.http.delete<any>(`${environment.baseURL1}/Vendor/DeleteOpeningDeficit/${id}`);
  }

  // Payment Settlement Workflow
  getPaymentSettlementList(
    clientId: number,
    modelId: number,
    transactionRange: string,
    locationId: string = '',
    vendorCode: string = '',
    paymentStatus: string = 'Pending',
    searchTerm: string = '',
    pageIndex: number = 1,
    pageSize: number = 50,
    isDeductionsSynced?: number | string
  ): Observable<any> {
    const params: string[] = [
      `clientId=${clientId}`,
      `modelId=${modelId}`,
      `transactionRange=${encodeURIComponent(transactionRange)}`,
      `locationId=${encodeURIComponent(locationId)}`,
      `vendorCode=${encodeURIComponent(vendorCode)}`,
      `paymentStatus=${encodeURIComponent(paymentStatus)}`,
      `searchTerm=${encodeURIComponent(searchTerm)}`,
      `pageIndex=${pageIndex}`,
      `pageSize=${pageSize}`,
      `_t=${Date.now()}`
    ];
    if (isDeductionsSynced !== undefined && isDeductionsSynced !== null && isDeductionsSynced !== '') {
      params.push(`isDeductionsSynced=${isDeductionsSynced}`);
    }
    return this.http.get<any>(`${environment.baseURL1}/Vendor/GetPaymentSettlementList?${params.join('&')}`);
  }

  recordPayment(payload: {
    transactionIds?: number[];
    isSelectAllCycle?: boolean;
    clientId?: number;
    modelId?: number;
    transactionRange?: string;
    locationId?: string;
    deductionsSyncedFilter?: number;
    paymentDate: string;
    paymentTransactionNo: string;
    paymentBankName?: string;
    paymentAccountNo?: string;
    paymentMode?: string;
    paymentRemarks?: string;
  }): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/RecordPayment`, payload);
  }

  revertPayment(payload: { transactionId: number; remarks?: string }): Observable<any> {
    return this.http.post<any>(`${environment.baseURL1}/Vendor/RevertPayment`, payload);
  }
}






