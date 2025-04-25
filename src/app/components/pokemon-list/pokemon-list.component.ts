import { Component, OnInit, inject } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

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
    console.log('Starting to load Pokémon');
    this.pokemonService.getPokemonList(0, 20).subscribe({
      next: (data) => {
        console.log('List data received:', data);
        const pokemonDetails = data.results.map((pokemon: any) => 
          this.pokemonService.getPokemonByName(pokemon.name)
        );
        
        forkJoin<any[]>(pokemonDetails).subscribe({
          next: (detailedPokemons) => {
            console.log('Detailed Pokémon:', detailedPokemons);
            this.pokemons = detailedPokemons;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Detail error:', err);
            this.error = 'Fehler beim Laden der Pokémon-Details';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('List error:', err);
        this.error = 'Fehler beim Laden der Pokémon-Liste';
        this.isLoading = false;
      }
    });
  }
}
