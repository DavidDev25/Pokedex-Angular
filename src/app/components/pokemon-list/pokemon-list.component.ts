import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { SearchService } from '../../services/search.service';
import { CommonModule } from '@angular/common';
import { forkJoin, Subscription } from 'rxjs';

/**
 * Component responsible for displaying the list of Pokémon.
 * 
 * This component provides functionality for:
 * - Displaying a paginated list of Pokémon
 * - Filtering Pokémon based on search input
 * - Loading more Pokémon on demand
 * - Displaying detailed information about a selected Pokémon
 * - Navigating between Pokémon in the detail view
 */
@Component({
  selector: 'app-pokemon-list',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.sass'] 
})
export class PokemonListComponent implements OnInit, OnDestroy {
  /**
   * Current search term used for filtering Pokémon
   */
  searchTerm: string = '';
  
  /**
   * Subscription to the search service for cleanup on component destruction
   * @private
   */
  private searchSubscription!: Subscription;
  
  /**
   * Array containing all loaded Pokémon data
   */
  pokemons: any[] = [];
  
  /**
   * Array containing Pokémon filtered by search term
   */
  filteredPokemons: any[] = [];
  
  /**
   * Flag indicating if initial Pokémon data is loading
   */
  isLoading = true;
  
  /**
   * Flag indicating if additional Pokémon data is being loaded
   */
  isLoadingMore = false;
  
  /**
   * Error message to display if loading fails
   */
  error: string | null = null;
  
  /**
   * Currently selected Pokémon for detailed view
   */
  selectedPokemon: any = null;
  
  /**
   * Current offset for pagination
   * @private
   */
  currentOffset = 0;
  
  /**
   * Number of Pokémon to load per request
   */
  limit = 20;
  
  /**
   * Service for retrieving Pokémon data
   * @private
   */
  private pokemonService = inject(PokemonService);
  
  /**
   * Service for managing search functionality
   * @private
   */
  private searchService = inject(SearchService);

  /**
   * Mapping of Pokémon types to their corresponding colors
   * Used for styling Pokémon cards and type badges
   */
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

  /**
   * Initializes the component by loading Pokémon data and subscribing to search changes
   */
  ngOnInit(): void {
    this.loadPokemon();
    this.searchSubscription = this.searchService.currentSearchTerm$.subscribe(term => {
      this.searchTerm = term;
      this.filterPokemons();
    });
  }
  
  /**
   * Cleans up subscriptions when the component is destroyed
   */
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
  
  /**
   * Filters the Pokémon list based on the current search term
   * Matches against Pokémon name, ID, or type
   */
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

  /**
   * Loads initial batch of Pokémon data from the API
   */
  loadPokemon(): void {
    this.isLoading = true;
    this.pokemonService.getPokemonList(this.currentOffset, this.limit).subscribe({
      next: (data) => {
        // Die Wrapper-Antwort enthält eine results-Eigenschaft mit den Pokemon-Daten
        if (!data || !data.results || !Array.isArray(data.results)) {
          this.error = 'Unerwartete API-Antwort';
          this.isLoading = false;
          return;
        }
        
        const detailRequests = data.results.map((pokemon: any) => 
          this.pokemonService.getPokemonByName(pokemon.name)
        );
        
        forkJoin<any[]>(detailRequests).subscribe({
          next: (detailedPokemons) => {
            // Filtere null-Werte heraus (falls API-Fehler)
            const validPokemons = detailedPokemons.filter(p => p !== null);
            this.pokemons = [...this.pokemons, ...validPokemons];
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

  /**
   * Loads additional Pokémon data when the user requests more
   */
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

  /**
   * Loads all available Pokémon data at once
   * Resets current data and pagination settings
   */
  loadAllPokemon(): void {
    this.isLoading = true;
    this.currentOffset = 0;
    this.limit = 1025;
    this.pokemons = []; 
    this.loadPokemon(); 
  }

  /**
   * Retrieves the primary type of a Pokémon
   * 
   * @param pokemon - The Pokémon object to extract the type from
   * @returns The name of the first type, or 'normal' if no types exist
   */
  getPrimaryType(pokemon: any): string {
    if (pokemon?.types && pokemon.types.length > 0) {
      return pokemon.types[0].type.name;
    }
    return 'normal';
  }

  /**
   * Gets the color associated with a Pokémon type
   * 
   * @param type - The type name to get the color for
   * @returns The hex color code for the specified type
   */
  getTypeColor(type: string): string {
    return this.typesColorMap[type.toLowerCase()] || '#A8A878';
  }

  /**
   * Opens the detail modal for a selected Pokémon
   * 
   * @param pokemon - The Pokémon to display in the modal
   */
  openModal(pokemon: any): void {
    this.selectedPokemon = pokemon;
  }

  /**
   * Closes the detail modal
   */
  closeModal(): void {
    this.selectedPokemon = null;
  }

  /**
   * Navigates to the previous Pokémon in the list when viewing details
   * Wraps around to the end of the list if at the beginning
   */
  navigateToPreviousPokemon(): void {
    if (!this.selectedPokemon) return;
    
    const currentIndex = this.pokemons.findIndex(p => p.id === this.selectedPokemon.id);
    if (currentIndex > 0) {
      this.selectedPokemon = this.pokemons[currentIndex - 1];
    } else if (currentIndex === 0) {
      this.selectedPokemon = this.pokemons[this.pokemons.length - 1];
    }
  }

  /**
   * Navigates to the next Pokémon in the list when viewing details
   * Wraps around to the beginning of the list if at the end
   */
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
