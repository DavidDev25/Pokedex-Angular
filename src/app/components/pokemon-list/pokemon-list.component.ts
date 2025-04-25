import { Component, OnInit, inject } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pokemon-list',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.sass'] 
})
export class PokemonListComponent implements OnInit {
  pokemons: any[] = [];
  isLoading = true;
  error: string | null = null;
  selectedPokemon: any = null;
  private pokemonService = inject(PokemonService);

  typesColorMap: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };

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

  getPrimaryType(pokemon: any): string {
    if (pokemon?.types && pokemon.types.length > 0) {
      return pokemon.types[0].type.name;
    }
    return 'normal';
  }

  getTypeColor(type: string): string {
    return this.typesColorMap[type.toLowerCase()] || '#A8A878';
  }

  openModal(pokemon: any): void {
    this.selectedPokemon = pokemon;
  }

  closeModal(): void {
    this.selectedPokemon = null;
  }
}
