import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LocationTrackerService, LocationRecord } from './location-tracker.service';
import { ToastrService } from 'ngx-toastr';
import { OlaMaps } from 'olamaps-web-sdk';

@Component({
  selector: 'app-location-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './location-tracker.component.html',
  styleUrl: './location-tracker.component.scss'
})
export class LocationTrackerComponent implements OnInit, AfterViewInit, OnDestroy {

  // Mode Selection: 'live' | 'history'
  public mode: 'live' | 'history' = 'live';

  // Search Controls
  public searchUserId: string = '';
  public searchDate: string = new Date().toISOString().split('T')[0];
  public autoRefreshLive: boolean = false;

  // Tracking Status ON/OFF for selected User
  public isUserTrackingEnabled: boolean = true;
  public isTogglingStatus: boolean = false;

  // Data State
  public employeesList: any[] = [];
  public selectedEmployeeObj: any = null;
  public isLoading: boolean = false;
  public liveRecord: LocationRecord | null = null;
  public historyRecords: LocationRecord[] = [];
  public totalDistanceKm: number = 0;
  public selectedPing: LocationRecord | null = null;

  // Playback State
  public isPlayingPlayback: boolean = false;
  public playbackIndex: number = 0;
  public playbackSpeed: number = 1; // 1x, 2x, 4x
  private playbackTimer: any = null;
  private liveInterval: any = null;

  // Mobile Friendly Controls
  public mobileActiveTab: 'all' | 'map' | 'data' = 'all';
  public isMapExpanded: boolean = false;

  // Ola Maps instances
  private olaMaps: any;
  private mapInstance: any;
  private mapMarkers: any[] = [];
  private playbackMarker: any = null;

  constructor(
    private trackerService: LocationTrackerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    try {
      this.olaMaps = new OlaMaps({
        apiKey: 'rFbNvM7s6utdC0GIOA7JlFzCvzJ33Te4poqsytwU'
      });
    } catch (e) {
      console.error('Failed to initialize OlaMaps SDK instance:', e);
    }

    this.loadEmployeeDropdown();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initOlaMap();
    }, 400);
  }

  /**
   * Loads employee dropdown list and normalizes Employee ID / Code
   */
  public loadEmployeeDropdown(): void {
    this.trackerService.getEmployeeDropdown().subscribe({
      next: (res) => {
        if (res && res.isSuccess && Array.isArray(res.data)) {
          this.employeesList = res.data.map((emp: any) => {
            // Support both standard HrBook NameValue { name, value } and custom employee fields
            const id = (emp.value ?? emp.id ?? emp.empCodeManual ?? emp.empCode ?? emp.empId ?? '').toString().trim();
            const displayName = emp.name ?? `${emp.empName || 'Employee'} (${id})`;
            return {
              id: id,
              name: displayName,
              raw: emp
            };
          }).filter((emp: any) => emp.id && emp.id.length > 0);

          if (this.employeesList.length > 0) {
            this.searchUserId = this.employeesList[0].id;
            this.selectedEmployeeObj = this.employeesList[0];
            this.fetchUserTrackingStatus();
            this.onSearch();
          }
        } else {
          this.fallbackEmployeeDropdown();
        }
      },
      error: () => {
        this.fallbackEmployeeDropdown();
      }
    });
  }

  private fallbackEmployeeDropdown(): void {
    this.employeesList = [
      { id: '101', name: 'Field Executive - EMP101 (101)' },
      { id: '102', name: 'Delivery Agent - EMP102 (102)' }
    ];
    this.searchUserId = '101';
    this.selectedEmployeeObj = this.employeesList[0];
    this.fetchUserTrackingStatus();
  }

  public onUserSelectChange(): void {
    if (this.searchUserId) {
      this.selectedEmployeeObj = this.employeesList.find(e => e.id === this.searchUserId) || null;
      this.fetchUserTrackingStatus();
      this.onSearch();
    }
  }

  public fetchUserTrackingStatus(): void {
    if (!this.searchUserId) return;

    this.trackerService.getUserTrackingStatus(this.searchUserId).subscribe({
      next: (res) => {
        if (res && res.isSuccess && res.data) {
          this.isUserTrackingEnabled = res.data.isTrackingEnabled ?? true;
        }
      },
      error: () => {
        this.isUserTrackingEnabled = true;
      }
    });
  }

  public toggleUserTracking(): void {
    if (!this.searchUserId) {
      this.toastr.warning('Please select an Employee first.');
      return;
    }

    const nextState = !this.isUserTrackingEnabled;
    this.isTogglingStatus = true;

    this.trackerService.toggleUserTrackingStatus(this.searchUserId, nextState).subscribe({
      next: (res) => {
        this.isTogglingStatus = false;
        if (res && res.isSuccess) {
          this.isUserTrackingEnabled = nextState;
          if (nextState) {
            this.toastr.success(`Location Tracking ENABLED for '${this.searchUserId}'`);
          } else {
            this.toastr.warning(`Location Tracking DISABLED for '${this.searchUserId}'`);
          }
        } else {
          this.toastr.error(res?.message || 'Failed to toggle tracking status.');
        }
      },
      error: () => {
        this.isTogglingStatus = false;
        this.toastr.error('Error updating tracking status.');
      }
    });
  }

  private initOlaMap(): void {
    const container = document.getElementById('olamapContainer');
    if (!container || !this.olaMaps) return;

    const defaultLat = 28.6139;
    const defaultLng = 77.2090;

    if (this.mapInstance && this.mapInstance.remove) {
      try {
        this.mapInstance.remove();
      } catch (e) {
        // ignore cleanup error
      }
      this.mapInstance = null;
    }

    try {
      this.mapInstance = this.olaMaps.init({
        style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
        container: 'olamapContainer',
        center: [defaultLng, defaultLat],
        zoom: 12
      });

      // Handle map resize when layout settles
      setTimeout(() => {
        if (this.mapInstance && this.mapInstance.resize) {
          this.mapInstance.resize();
        }
      }, 500);
    } catch (e) {
      console.error('Failed to initialize Ola Maps:', e);
    }
  }

  public toggleMapExpand(): void {
    this.isMapExpanded = !this.isMapExpanded;
    setTimeout(() => {
      if (this.mapInstance && this.mapInstance.resize) {
        this.mapInstance.resize();
      }
    }, 250);
  }

  public setMobileTab(tab: 'all' | 'map' | 'data'): void {
    this.mobileActiveTab = tab;
    setTimeout(() => {
      if (this.mapInstance && this.mapInstance.resize) {
        this.mapInstance.resize();
      }
    }, 250);
  }

  public recenterMap(): void {
    if (!this.mapInstance) return;

    if (this.mode === 'live' && this.liveRecord) {
      this.mapInstance.panTo([this.liveRecord.longitude, this.liveRecord.latitude]);
      this.mapInstance.setZoom(14);
    } else if (this.mode === 'history' && this.historyRecords.length > 0) {
      const mid = Math.floor(this.historyRecords.length / 2);
      this.mapInstance.panTo([this.historyRecords[mid].longitude, this.historyRecords[mid].latitude]);
      this.mapInstance.setZoom(13);
    } else {
      this.mapInstance.panTo([77.2090, 28.6139]);
      this.mapInstance.setZoom(11);
    }
  }

  public setMode(newMode: 'live' | 'history'): void {
    this.mode = newMode;
    this.stopPlayback();
    this.clearMapElements();
    this.liveRecord = null;
    this.historyRecords = [];

    if (newMode === 'live' && this.searchUserId) {
      this.fetchLiveLocation();
    } else if (newMode === 'history' && this.searchUserId) {
      this.fetchHistoryLocation();
    }
  }

  public onSearch(): void {
    if (!this.searchUserId) {
      this.toastr.warning('Please enter or select an Employee.');
      return;
    }

    this.stopPlayback();
    this.clearMapElements();
    this.fetchUserTrackingStatus();

    if (this.mode === 'live') {
      this.fetchLiveLocation();
    } else {
      this.fetchHistoryLocation();
    }
  }

  public resetFilters(): void {
    if (this.employeesList.length > 0) {
      this.searchUserId = this.employeesList[0].id;
      this.selectedEmployeeObj = this.employeesList[0];
    } else {
      this.searchUserId = '';
      this.selectedEmployeeObj = null;
    }
    this.searchDate = new Date().toISOString().split('T')[0];
    this.stopPlayback();
    this.clearMapElements();
    this.liveRecord = null;
    this.historyRecords = [];
    this.totalDistanceKm = 0;
    this.playbackIndex = 0;
    this.fetchUserTrackingStatus();
  }

  public toggleAutoRefresh(): void {
    this.autoRefreshLive = !this.autoRefreshLive;
    if (this.autoRefreshLive && this.mode === 'live') {
      this.liveInterval = setInterval(() => {
        if (this.searchUserId) {
          this.fetchLiveLocation(true);
        }
      }, 5000);
      this.toastr.info('Live auto-polling active (5s)');
    } else {
      if (this.liveInterval) {
        clearInterval(this.liveInterval);
        this.liveInterval = null;
      }
      this.toastr.info('Live auto-polling stopped');
    }
  }

  private fetchLiveLocation(silent: boolean = false): void {
    if (!silent) this.isLoading = true;

    this.trackerService.getLiveLocation(this.searchUserId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.isSuccess && res.data) {
          this.liveRecord = res.data;
          this.renderLiveOnMap(this.liveRecord!);
          if (!silent) this.toastr.success(`Live location loaded for: ${this.searchUserId}`);
        } else {
          this.liveRecord = null;
          if (!silent) this.toastr.info(res?.message || 'No location records found for this employee.');
        }
      },
      error: () => {
        this.isLoading = false;
        if (!silent) this.toastr.error('Error fetching live location.');
      }
    });
  }

  private fetchHistoryLocation(): void {
    if (!this.searchDate) {
      this.toastr.warning('Please select a date for history search.');
      return;
    }

    this.isLoading = true;
    this.trackerService.getLocationHistory(this.searchUserId, this.searchDate).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.isSuccess && res.data && res.data.length > 0) {
          this.historyRecords = res.data;
          this.calculateTotalDistance();
          this.renderHistoryOnMap(this.historyRecords);
          this.toastr.success(`Loaded ${this.historyRecords.length} pings for ${this.searchDate}`);
        } else {
          this.historyRecords = [];
          this.totalDistanceKm = 0;
          this.toastr.info(`No location history entries found for ${this.searchUserId} on ${this.searchDate}.`);
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Error fetching location history.');
      }
    });
  }

  private calculateTotalDistance(): void {
    let distance = 0;
    for (let i = 1; i < this.historyRecords.length; i++) {
      const prev = this.historyRecords[i - 1];
      const curr = this.historyRecords[i];
      distance += this.haversineDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    }
    this.totalDistanceKm = Math.round(distance * 100) / 100;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private clearMapElements(): void {
    if (this.mapMarkers.length > 0) {
      this.mapMarkers.forEach(m => {
        if (m && m.remove) m.remove();
      });
      this.mapMarkers = [];
    }

    if (this.playbackMarker && this.playbackMarker.remove) {
      this.playbackMarker.remove();
      this.playbackMarker = null;
    }

    if (this.mapInstance) {
      try {
        if (this.mapInstance.getLayer('route-layer')) {
          this.mapInstance.removeLayer('route-layer');
        }
        if (this.mapInstance.getSource('route-source')) {
          this.mapInstance.removeSource('route-source');
        }
      } catch (e) {
        // Ignore source cleanup errors
      }
    }
  }

  private renderLiveOnMap(rec: LocationRecord): void {
    this.clearMapElements();
    if (!this.mapInstance || !this.olaMaps) return;

    const el = document.createElement('div');
    el.className = 'live-pulsing-marker';
    el.innerHTML = `
      <div style="background:#0284c7; width:22px; height:22px; border-radius:50%; border:3px solid #ffffff; box-shadow: 0 0 16px #0284c7; position:relative;">
        <div style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(2,132,199,0.35); top:-14px; left:-14px; animation: pulse 1.6s infinite;"></div>
      </div>`;

    const marker = this.olaMaps.addMarker({ element: el, offset: [0, 0], anchor: 'center' })
      .setLngLat([rec.longitude, rec.latitude])
      .addTo(this.mapInstance);

    this.mapMarkers.push(marker);
    this.mapInstance.panTo([rec.longitude, rec.latitude]);
    this.mapInstance.setZoom(14);
  }

  private renderHistoryOnMap(records: LocationRecord[]): void {
    this.clearMapElements();
    if (!this.mapInstance || !this.olaMaps || records.length === 0) return;

    const coords: [number, number][] = records.map(r => [r.longitude, r.latitude]);

    try {
      if (this.mapInstance.getSource('route-source')) {
        (this.mapInstance.getSource('route-source') as any).setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: coords }
        });
      } else {
        this.mapInstance.addSource('route-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: coords }
          }
        });

        this.mapInstance.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route-source',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#3080e8',
            'line-width': 5,
            'line-opacity': 0.85
          }
        });
      }
    } catch (e) {
      console.warn('Map line rendering fallback:', e);
    }

    const startRec = records[0];
    const startEl = document.createElement('div');
    startEl.innerHTML = `<div style="background:#16a34a; color:#fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; border:2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">S</div>`;
    const startMarker = this.olaMaps.addMarker({ element: startEl, anchor: 'center' })
      .setLngLat([startRec.longitude, startRec.latitude])
      .addTo(this.mapInstance);
    this.mapMarkers.push(startMarker);

    const endRec = records[records.length - 1];
    if (records.length > 1) {
      const endEl = document.createElement('div');
      endEl.innerHTML = `<div style="background:#dc2626; color:#fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; border:2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">E</div>`;
      const endMarker = this.olaMaps.addMarker({ element: endEl, anchor: 'center' })
        .setLngLat([endRec.longitude, endRec.latitude])
        .addTo(this.mapInstance);
      this.mapMarkers.push(endMarker);
    }

    const midIndex = Math.floor(records.length / 2);
    this.mapInstance.panTo([records[midIndex].longitude, records[midIndex].latitude]);
  }

  public selectPing(record: LocationRecord): void {
    this.selectedPing = record;
    if (this.mapInstance && this.olaMaps && record) {
      this.mapInstance.panTo([record.longitude, record.latitude]);

      const el = document.createElement('div');
      el.innerHTML = `<div style="background:#f59e0b; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 12px #f59e0b;"></div>`;
      const focusMarker = this.olaMaps.addMarker({ element: el, anchor: 'center' })
        .setLngLat([record.longitude, record.latitude])
        .addTo(this.mapInstance);

      setTimeout(() => {
        if (focusMarker && focusMarker.remove) focusMarker.remove();
      }, 3000);
    }
  }

  public togglePlayback(): void {
    if (this.historyRecords.length === 0) return;

    if (this.isPlayingPlayback) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  public setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = speed;
    if (this.isPlayingPlayback) {
      this.stopPlayback();
      this.startPlayback();
    }
  }

  private startPlayback(): void {
    if (this.historyRecords.length === 0) return;
    this.isPlayingPlayback = true;
    if (this.playbackIndex >= this.historyRecords.length) {
      this.playbackIndex = 0;
    }

    const interval = Math.max(150, Math.floor(800 / this.playbackSpeed));

    this.playbackTimer = setInterval(() => {
      if (this.playbackIndex < this.historyRecords.length) {
        const currentRec = this.historyRecords[this.playbackIndex];
        this.updatePlaybackMarker(currentRec);
        this.playbackIndex++;
      } else {
        this.stopPlayback();
      }
    }, interval);
  }

  private updatePlaybackMarker(rec: LocationRecord): void {
    if (!this.mapInstance || !this.olaMaps) return;

    if (!this.playbackMarker) {
      const el = document.createElement('div');
      el.innerHTML = `<div style="background:#9333ea; width:24px; height:24px; border-radius:50%; border:3px solid #fff; box-shadow: 0 0 16px #9333ea;"></div>`;
      this.playbackMarker = this.olaMaps.addMarker({ element: el, anchor: 'center' })
        .setLngLat([rec.longitude, rec.latitude])
        .addTo(this.mapInstance);
    } else {
      this.playbackMarker.setLngLat([rec.longitude, rec.latitude]);
    }
    this.mapInstance.panTo([rec.longitude, rec.latitude]);
  }

  public stopPlayback(): void {
    this.isPlayingPlayback = false;
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  public copyCoordinates(rec: LocationRecord): void {
    if (!rec) return;
    const coordsText = `${rec.latitude}, ${rec.longitude}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(coordsText).then(() => {
        this.toastr.success(`Copied coordinates: ${coordsText}`);
      });
    } else {
      this.toastr.info(`Coordinates: ${coordsText}`);
    }
  }

  public openInGoogleMaps(lat: number, lng: number): void {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  }

  public getRelativeTime(timestamp: string): string {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      const diffMs = Date.now() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 45) return 'Just now';
      if (diffSec < 90) return '1 min ago';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} mins ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${Math.floor(diffHrs / 24)}d ago`;
    } catch {
      return timestamp;
    }
  }

  public getFreshnessStatus(timestamp: string): 'active' | 'idle' | 'offline' {
    if (!timestamp) return 'offline';
    try {
      const date = new Date(timestamp);
      const diffMin = (Date.now() - date.getTime()) / 60000;
      if (diffMin <= 5) return 'active';
      if (diffMin <= 60) return 'idle';
      return 'offline';
    } catch {
      return 'offline';
    }
  }

  ngOnDestroy(): void {
    this.stopPlayback();
    if (this.liveInterval) {
      clearInterval(this.liveInterval);
    }
    if (this.mapInstance && this.mapInstance.remove) {
      try {
        this.mapInstance.remove();
      } catch (e) {
        // ignore
      }
    }
  }
}
