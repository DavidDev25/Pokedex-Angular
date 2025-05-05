import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { SearchService } from './services/search.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'Pokedex-Angular';
  
  constructor(private searchService: SearchService) {}

  handleSearch(term: string): void {
    this.searchService.updateSearchTerm(term);
  }
}
