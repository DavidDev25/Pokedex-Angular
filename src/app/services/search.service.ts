import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service responsible for managing search functionality across the application.
 * 
 * This service provides a centralized way to handle search terms,
 * allowing components to both update and subscribe to search term changes.
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  /**
   * Private BehaviorSubject that stores the current search term.
   * Initial value is an empty string.
   * @private
   */
  private searchTerms = new BehaviorSubject<string>('');
  
  /**
   * Observable that components can subscribe to for receiving search term updates.
   * This exposes the searchTerms BehaviorSubject as a read-only Observable.
   */
  currentSearchTerm$ = this.searchTerms.asObservable();
  
  /**
   * Updates the current search term.
   * 
   * @param term - The new search term to be broadcast to all subscribers
   * @example
   * // To update the search term:
   * this.searchService.updateSearchTerm('pikachu');
   */
  updateSearchTerm(term: string): void {
    this.searchTerms.next(term);
  }
}