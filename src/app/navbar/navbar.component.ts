import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * Navigation bar component for the Pokedex application.
 * 
 * This component displays the application header and provides search functionality
 * that allows users to filter Pokémon in real-time. It emits search events to
 * parent components when the user types or submits a search.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.sass'
})
export class NavbarComponent {
  /**
   * Event emitter that sends search terms to parent components.
   * Emits the current search value when a user types or submits a search.
   */
  @Output() search = new EventEmitter<string>();
  
  /**
   * The current search term entered by the user.
   * This is bound to the search input field in the template.
   */
  searchTerm: string = '';

  /**
   * Handles search form submission events.
   * Emits the current search term to parent components.
   */
  onSearch(): void {
    this.search.emit(this.searchTerm);
  }
  
  /**
   * Handles input events while the user is typing in the search box.
   * Enables real-time search filtering by emitting the search term on each keystroke.
   */
  onSearchInput(): void {
    this.search.emit(this.searchTerm);
  }
}
