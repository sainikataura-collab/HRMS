import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface TaskToastItem {
  id: string;
  taskId: number;
  taskCode: string;
  subject: string;
  eventType: 'CREATED' | 'STATUS_CHANGED' | 'REASSIGNED' | 'RECURRENCE';
  priority?: string;
  status?: string;
  actorName?: string;
  message?: string;
  time: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TaskToastService {
  private toastSubject = new Subject<TaskToastItem>();
  public toast$: Observable<TaskToastItem> = this.toastSubject.asObservable();

  private audioCtx: AudioContext | null = null;
  private recentToastKeys = new Set<string>();

  show(item: Omit<TaskToastItem, 'id' | 'time'>): void {
    const dedupKey = `${item.taskId}_${item.eventType}_${item.status || ''}`;
    if (this.recentToastKeys.has(dedupKey)) {
      return; // Suppress duplicate triggers for the same event in 2.5s window
    }
    this.recentToastKeys.add(dedupKey);
    setTimeout(() => this.recentToastKeys.delete(dedupKey), 2500);

    const toastItem: TaskToastItem = {
      ...item,
      id: 'tt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      time: new Date()
    };
    this.toastSubject.next(toastItem);
    this.playChime();
  }

  /**
   * Synthesize an elegant two-tone harmonic chime (C5 523.25Hz -> E5 659.25Hz)
   * using the standard Web Audio API. Pure synthesis with zero external MP3 assets.
   */
  public playChime(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Note 1: C5 (523.25 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 0.36);

      // Note 2: E5 (659.25 Hz) harmonic follow-up
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.09);

      gain2.gain.setValueAtTime(0.001, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.22, now + 0.11);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);

      osc2.start(now + 0.09);
      osc2.stop(now + 0.61);
    } catch (err) {
      console.warn('Task notification chime playback suppressed or unsupported:', err);
    }
  }
}

