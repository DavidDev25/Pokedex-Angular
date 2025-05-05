import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchTerms = new BehaviorSubject<string>('');
  
  currentSearchTerm$ = this.searchTerms.asObservable();
  
  updateSearchTerm(term: string): void {
    this.searchTerms.next(term);
  }
}