import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Capacitor, CapacitorHttp, registerPlugin } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface BackgroundGeolocationPlugin {
  addWatcher(
    options: {
      backgroundMessage?: string;
      backgroundTitle?: string;
      requestPermissions?: boolean;
      stale?: boolean;
      distanceFilter?: number;
      userId?: string;
    },
    callback: (location?: any, error?: any) => void
  ): Promise<string>;
  removeWatcher(options: { id: string }): Promise<void>;
}

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export interface LocationPayload {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  isBackground: boolean;
  batteryLevel?: number;
  deviceInfo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationTrackerService {
  public apiUrl = 'https://hrmsapi.empowerlogics.com/api/Location/update';

  private watcherId: string | null = null;
  private timerId: any = null;
  private watchPositionId: string | null = null;

  public isTracking$ = new BehaviorSubject<boolean>(false);
  public telemetryLogs$ = new BehaviorSubject<string[]>([]);
  public currentLocation$ = new BehaviorSubject<{ lat: number; lng: number; accuracy: number } | null>(null);
  public permissionState$ = new BehaviorSubject<string>('Unknown');

  public isNative = Capacitor.isNativePlatform();

  // Route Simulation coordinates for browser desktop testing
  private simRoute = [
    { lat: 37.774929, lng: -122.419416 },
    { lat: 37.775500, lng: -122.418200 },
    { lat: 37.776100, lng: -122.417000 },
    { lat: 37.776800, lng: -122.415800 },
    { lat: 37.777600, lng: -122.414600 },
    { lat: 37.778500, lng: -122.413200 },
    { lat: 37.779400, lng: -122.412000 }
  ];
  private simIndex = 0;

  constructor(private http: HttpClient) {
    if (this.isNative) {
      this.checkAndRequestPermissions();
    }
  }

  public async checkAndRequestPermissions(): Promise<boolean> {
    try {
      this.log('Requesting Location & Notification Permissions...');
      
      // 1. Request Android Notification Permission (POST_NOTIFICATIONS)
      const notifPerm = await LocalNotifications.requestPermissions();
      this.log(`Notification Permission: [${notifPerm.display}]`);

      // 2. Request Location Permission (ACCESS_FINE_LOCATION & BACKGROUND)
      const locPerm = await Geolocation.requestPermissions();
      this.permissionState$.next(locPerm.location);
      this.log(`Location Permission: [${locPerm.location}]`);

      return locPerm.location === 'granted';
    } catch (err: any) {
      this.log(`Permission Notice: ${err?.message || err}`);
      return false;
    }
  }

  public async startTracking(mode: 'native' | 'simulator' | 'browser', userId: string, intervalMs: number = 4000) {
    this.isTracking$.next(true);
    this.log(`Starting tracking in [${mode.toUpperCase()}] mode...`);

    if (mode === 'native' || this.isNative) {
      await this.checkAndRequestPermissions();
      await this.showPersistentNotification();
      await this.startNativeBackgroundTracking(userId);
    } else if (mode === 'simulator') {
      this.timerId = setInterval(() => this.tickSimulator(userId), intervalMs);
      this.tickSimulator(userId);
    } else {
      this.startBrowserTracking(userId);
    }
  }

  public async stopTracking() {
    this.isTracking$.next(false);

    if (this.watcherId) {
      try {
        await BackgroundGeolocation.removeWatcher({ id: this.watcherId });
      } catch (e) {}
      this.watcherId = null;
    }
    if (this.watchPositionId) {
      try {
        await Geolocation.clearWatch({ id: this.watchPositionId });
      } catch (e) {}
      this.watchPositionId = null;
    }
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    await this.removePersistentNotification();
    this.log('Tracking stopped.');
  }

  private async showPersistentNotification() {
    if (!this.isNative) return;
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '📍 GPS Background Tracker Running',
            body: 'Continuously sending location updates to .NET API',
            id: 9999,
            ongoing: true, // Makes notification persistent & non-dismissable in Android status bar!
            autoCancel: false,
            smallIcon: 'ic_launcher'
          }
        ]
      });
      this.log('🔔 Persistent Status Bar Notification Triggered (Ongoing)');
    } catch (err: any) {
      this.log(`Notification Schedule Error: ${err?.message || err}`);
    }
  }

  private async removePersistentNotification() {
    if (!this.isNative) return;
    try {
      await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
    } catch (e) {}
  }

  private async startNativeBackgroundTracking(userId: string) {
    // 1. Initialize Native Foreground Location Watcher
    try {
      this.watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: 'Continuously tracking position for .NET API.',
          backgroundTitle: '📍 GPS Background Tracker Running',
          requestPermissions: true,
          stale: false,
          distanceFilter: 1, // Update every 1 meter movement
          userId: userId // Pass dynamic employee ID to native Java background service
        },
        (location, error) => {
          if (error) {
            this.log(`Background Watcher Error: ${error.message}`);
            return;
          }
          if (location) {
            this.handlePosition(location.latitude, location.longitude, location.accuracy, userId, true, 'Android Persistent Foreground Service');
          }
        }
      );
      this.log('Native Background Geolocation Active');
    } catch (err: any) {
      this.log(`Background Foreground Service Error: ${err?.message || err}`);
    }

    // 2. Geolocation Watcher
    try {
      this.watchPositionId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000 },
        (position, err) => {
          if (err) {
            this.log(`Capacitor Watch Error: ${err.message}`);
            return;
          }
          if (position) {
            this.handlePosition(
              position.coords.latitude,
              position.coords.longitude,
              position.coords.accuracy,
              userId,
              true,
              'Android Native GPS'
            );
          }
        }
      );
      this.log('Capacitor Geolocation Watcher Active');
    } catch (e: any) {
      this.log(`Native Watch Fallback Error: ${e?.message || e}`);
    }
  }

  private startBrowserTracking(userId: string) {
    if (!('geolocation' in navigator)) {
      this.log('Browser does not support HTML5 Geolocation');
      return;
    }
    navigator.geolocation.watchPosition(
      (pos) => this.handlePosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, userId, false, 'Web Browser Client'),
      (err) => this.log(`GPS Error: ${err.message}`),
      { enableHighAccuracy: true }
    );
  }

  private tickSimulator(userId: string) {
    const point = this.simRoute[this.simIndex];
    const lat = point.lat + (Math.random() - 0.5) * 0.0001;
    const lng = point.lng + (Math.random() - 0.5) * 0.0001;

    this.handlePosition(lat, lng, 10 + Math.random() * 5, userId, true, 'Simulator Engine');
    this.simIndex = (this.simIndex + 1) % this.simRoute.length;
  }

  private handlePosition(lat: number, lng: number, accuracy: number, userId: string, isBackground: boolean, deviceInfo: string) {
    this.currentLocation$.next({ lat, lng, accuracy });

    const payload: LocationPayload = {
      userId,
      latitude: lat,
      longitude: lng,
      accuracy: Math.round(accuracy),
      timestamp: new Date().toISOString(),
      isBackground,
      batteryLevel: 95,
      deviceInfo
    };

    this.postToDotNetApi(payload);
  }

  private async postToDotNetApi(payload: LocationPayload) {
    const startTime = performance.now();

    if (this.isNative) {
      try {
        const response = await CapacitorHttp.post({
          url: this.apiUrl,
          headers: { 'Content-Type': 'application/json' },
          data: payload
        });
        const elapsed = Math.round(performance.now() - startTime);

        if (response.status === 200 || response.status === 201) {
          this.log(`[POST 201] Lat:${payload.latitude.toFixed(4)}, Lng:${payload.longitude.toFixed(4)} (${elapsed}ms)`);
          
          const responseData = response.data || {};
          if (responseData.isTrackingEnabled === false || responseData.data?.isTrackingEnabled === false) {
            this.log('Location tracking turned OFF by User. Self-stopping background worker...');
            this.stopTracking();
          }
        } else {
          this.log(`[POST ${response.status}] API Error: ${response.data?.error || response.status}`);
        }
      } catch (err: any) {
        this.log(`[Native HTTP Error] ${err?.message || err} (Target: ${this.apiUrl})`);
      }
    } else {
      this.http.post(this.apiUrl, payload).subscribe({
        next: (res: any) => {
          const elapsed = Math.round(performance.now() - startTime);
          this.log(`[POST 201] Lat:${payload.latitude.toFixed(4)}, Lng:${payload.longitude.toFixed(4)} (${elapsed}ms)`);
          
          if (res?.isTrackingEnabled === false || res?.data?.isTrackingEnabled === false) {
            this.log('Location tracking turned OFF by User. Self-stopping background worker...');
            this.stopTracking();
          }
        },
        error: (err) => {
          this.log(`[POST Error] ${err.message} (Target: ${this.apiUrl})`);
        }
      });
    }
  }

  public log(msg: string) {
    const timeStr = new Date().toLocaleTimeString();
    const formatted = `[${timeStr}] ${msg}`;
    const current = this.telemetryLogs$.value;
    this.telemetryLogs$.next([...current, formatted]);
  }
}
