import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';
import { CommonModule } from '@angular/common';

/**
 * Component responsible for displaying detailed information about a specific Pokémon.
 * 
 * This component retrieves Pokémon data based on the name parameter from the URL route
 * and displays comprehensive information about the selected Pokémon.
 */
@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-detail.component.html',
})
export class PokemonDetailComponent implements OnInit {
  /**
   * The Pokémon data object containing all details about the selected Pokémon
   */
  pokemon: any;
  
  /**
   * The activated route service used to access URL parameters
   * @private
   */
  private route = inject(ActivatedRoute);
  
  /**
   * Service for retrieving Pokémon data from the API
   * @private
   */
  private pokemonService = inject(PokemonService);

  /**
   * Initializes the component by loading Pokémon data based on the route parameter
   * Retrieves the Pokémon name from the URL and fetches corresponding data
   */
  ngOnInit() {
    const name = this.route.snapshot.paramMap.get('name');
    if (name) {
      this.pokemonService.getPokemonByName(name).subscribe(data => {
        this.pokemon = data;
      });
    }
  }
}
