import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';



@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchQuerySubject = new BehaviorSubject<string>('');
  private suggestionsSubject = new BehaviorSubject<any[]>([]);
  private availableMenus: any[] = []; // store menus from sidebar

  currentSearchQuery = this.searchQuerySubject.asObservable();
  currentSuggestions = this.suggestionsSubject.asObservable();

  updateSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
    this.updateSuggestions(query);
  }

  // 🔥 Sidebar se menus set karne ka function
  setAvailableMenus(menus: any[]): void {
    this.availableMenus = menus;
  }

  private updateSuggestions(query: string): void {
    if (query && this.availableMenus.length > 0) {
      this.suggestionsSubject.next(
        this.availableMenus.filter(item =>
          //item.menucaption.toLowerCase().includes(query.toLowerCase())
           item.menucaption?.toLowerCase().includes(query.toLowerCase()) &&
        item.pagepath !== '#'   // 🔥 exclude these
      
        )
      );
    } else {
      this.suggestionsSubject.next([]);
    }
  }
  
}
