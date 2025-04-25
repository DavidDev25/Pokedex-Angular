import { Component, OnInit, inject } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-list',
  standalone: true, 
  imports: [CommonModule, RouterLink], 
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.sass'] 
})
export class PokemonListComponent implements OnInit {
  pokemons: any[] = [];
  isLoading = true;
  error: string | null = null;
  private pokemonService = inject(PokemonService);

  ngOnInit(): void {
    this.pokemonService.getPokemonList(0, 20).subscribe({
      next: (data) => {
        this.pokemons = data.results;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Fehler beim Laden der Pokémon-Liste';
        this.isLoading = false;
      }
    });
  }
}
