import { Component, OnInit, inject } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-pokemon-list',
  standalone: true, 
  imports: [CommonModule, TranslateModule,], 
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.sass'] 
})
export class PokemonListComponent implements OnInit {
  pokemons: any[] = [];
  isLoading = true;
  error: string | null = null;
  selectedPokemon: any = null;
  private pokemonService = inject(PokemonService);
  private translationService = inject(TranslationService);

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
    this.translationService.currentLang$.subscribe(lang => {
      this.loadPokemon(lang);
    });
  }

  loadPokemon(language: string): void {
    this.isLoading = true;
    this.pokemonService.getPokemonList(0, 20, language).subscribe({
      next: (data) => {
        const pokemonDetails = data.results.map((pokemon: any) => 
          this.pokemonService.getPokemonByName(pokemon.name, language)
        );
        
        forkJoin<any[]>(pokemonDetails).subscribe({
          next: (detailedPokemons) => {
            this.pokemons = detailedPokemons.map(pokemon => ({
              ...pokemon,
              localizedName: this.getLocalizedName(pokemon, language),
              localizedTypes: this.getLocalizedTypes(pokemon, language)
            }));
            this.isLoading = false;
          },
          error: (err) => {
            this.error = 'Error loading Pokémon details';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Error loading Pokémon list';
        this.isLoading = false;
      }
    });
  }

  getLocalizedName(pokemon: any, language: string): string {
    const names = pokemon.speciesInfo?.names || [];
    const localizedName = names.find((name: any) => name.language.name === language);
    return localizedName ? localizedName.name : pokemon.name;
  }

  getLocalizedTypes(pokemon: any, language: string): string[] {
    return pokemon.types.map((type: any) => type.type.name);
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
