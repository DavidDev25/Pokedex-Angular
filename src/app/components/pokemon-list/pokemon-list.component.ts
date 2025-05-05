import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { SearchService } from '../../services/search.service';
import { CommonModule } from '@angular/common';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'app-pokemon-list',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.sass'] 
})
export class PokemonListComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  private searchSubscription!: Subscription;
  
  pokemons: any[] = [];
  filteredPokemons: any[] = [];
  isLoading = true;
  isLoadingMore = false;
  error: string | null = null;
  selectedPokemon: any = null;
  currentOffset = 0;
  limit = 20;
  private pokemonService = inject(PokemonService);
  private searchService = inject(SearchService);

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
    this.loadPokemon();
    this.searchSubscription = this.searchService.currentSearchTerm$.subscribe(term => {
      this.searchTerm = term;
      this.filterPokemons();
    });
  }
  
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
  
  filterPokemons(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredPokemons = [...this.pokemons];
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredPokemons = this.pokemons.filter(pokemon => 
      pokemon.name.toLowerCase().includes(term) || 
      pokemon.id.toString().includes(term) ||
      pokemon.types.some((type: any) => type.type.name.toLowerCase().includes(term))
    );
  }

  loadPokemon(): void {
    this.isLoading = true;
    this.pokemonService.getPokemonList(this.currentOffset, this.limit).subscribe({
      next: (data) => {
        const pokemonDetails = data.results.map((pokemon: any) => 
          this.pokemonService.getPokemonByName(pokemon.name)
        );
        
        forkJoin<any[]>(pokemonDetails).subscribe({
          next: (detailedPokemons) => {
            this.pokemons = this.pokemons.concat(detailedPokemons);
            this.filterPokemons();
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

  loadMorePokemon(): void {
    if (this.isLoadingMore) return;
    
    this.isLoadingMore = true;
    this.currentOffset += this.limit;
    
    this.pokemonService.getPokemonList(this.currentOffset, this.limit).subscribe({
      next: (data) => {
        const pokemonDetails = data.results.map((pokemon: any) => 
          this.pokemonService.getPokemonByName(pokemon.name)
        );
        
        forkJoin<any[]>(pokemonDetails).subscribe({
          next: (detailedPokemons) => {
            this.pokemons = [...this.pokemons, ...detailedPokemons];
            this.filterPokemons();
            this.isLoadingMore = false;
          },
          error: (err) => {
            this.error = 'Error loading additional Pokémon details';
            this.isLoadingMore = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Error loading additional Pokémon';
        this.isLoadingMore = false;
      }
    });
  }

  loadAllPokemon(): void {
    this.isLoading = true;
    this.currentOffset = 0;
    this.limit = 1025;
    this.pokemons = []; 
    this.loadPokemon(); 
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

  navigateToPreviousPokemon(): void {
    if (!this.selectedPokemon) return;
    
    const currentIndex = this.pokemons.findIndex(p => p.id === this.selectedPokemon.id);
    if (currentIndex > 0) {
      this.selectedPokemon = this.pokemons[currentIndex - 1];
    } else if (currentIndex === 0) {
      this.selectedPokemon = this.pokemons[this.pokemons.length - 1];
    }
  }

  navigateToNextPokemon(): void {
    if (!this.selectedPokemon) return;
    
    const currentIndex = this.pokemons.findIndex(p => p.id === this.selectedPokemon.id);
    if (currentIndex >= 0) {
      if (currentIndex < this.pokemons.length - 1) {
        this.selectedPokemon = this.pokemons[currentIndex + 1];
      } else { 
        this.selectedPokemon = this.pokemons[0];
      }
    }
  }
}
