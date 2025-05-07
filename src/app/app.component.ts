import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { SearchService } from './services/search.service';

/**
 * Root component of the Pokedex application.
 * 
 * This component serves as the entry point for the application and
 * manages the top-level layout including the navbar and router outlet.
 * It also handles search functionality by communicating with the SearchService.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  /**
   * The title of the application.
   */
  title = 'Pokedex-Angular';
  
  /**
   * Creates an instance of AppComponent.
   * 
   * @param searchService - Service for managing search functionality
   */
  constructor(private searchService: SearchService) {}

  /**
   * Handles search events from child components.
   * Forwards the search term to the SearchService.
   * 
   * @param term - The search term entered by the user
   */
  handleSearch(term: string): void {
    this.searchService.updateSearchTerm(term);
  }
}
