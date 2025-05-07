import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, forkJoin, of, catchError } from 'rxjs';

/**
 * Service for fetching Pokémon data from the PokéAPI.
 * Provides methods to retrieve Pokémon lists, individual Pokémon details,
 * species information, abilities and moves.
 */
@Injectable({ providedIn: 'root' })
export class PokemonService {
  /**
   * HttpClient instance used to make API requests
   * @private
   */
  private http = inject(HttpClient);
  
  /**
   * Base URL for the PokéAPI
   * @private
   */
  private apiUrl = 'https://pokeapi.co/api/v2';

  /**
   * Retrieves a paginated list of Pokémon with their details and species information.
   * Uses forkJoin to parallelize requests for better performance.
   * 
   * @param offset Number of Pokémon to skip (for pagination), defaults to 0
   * @param limit Maximum number of Pokémon to retrieve, defaults to 20
   * @returns Observable containing Pokémon list data with detailed information
   */
  getPokemonList(offset = 0, limit = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon?offset=${offset}&limit=${limit}`)
      .pipe(
        switchMap((data: any) => {
          const pokemonList = data.results;
          const pokemonRequests: Observable<any>[] = pokemonList.map((pokemon: any) =>
            this.http.get(pokemon.url)
          );
          
          return forkJoin(pokemonRequests).pipe(
            switchMap((pokemonData: any[]) => {
              const speciesRequests = pokemonData.map((pokemon: any) =>
                this.getPokemonSpeciesFromUrl(pokemon.species.url).catch(() => null)
              );
              
              return forkJoin(speciesRequests).pipe(
                map(speciesData => {
                  return {
                    ...data,
                    results: pokemonData.map((pokemon: any, index: number) => ({
                      ...pokemon,
                      speciesInfo: speciesData[index]
                    }))
                  };
                })
              );
            })
          );
        })
      );
  }

  /**
   * Retrieves detailed information for a specific Pokémon by name.
   * Includes the basic Pokémon data enhanced with species information.
   * 
   * @param name The name of the Pokémon to retrieve
   * @returns Observable containing detailed Pokémon data or null if not found
   */
  getPokemonByName(name: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon/${name}`).pipe(
      switchMap((pokemonData: any) => 
        this.getPokemonSpeciesFromUrl(pokemonData.species.url)
          .then(speciesData => ({
            ...pokemonData,
            speciesInfo: speciesData
          }))
          .catch(() => ({
            ...pokemonData,
            speciesInfo: null
          }))
      ),
      catchError(error => {
        console.error(`Error fetching Pokémon ${name}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Fetches species-specific data for a Pokémon from the provided URL.
   * This includes information like evolution chains, flavor text, genera, etc.
   * 
   * @param speciesUrl The full URL to the species resource
   * @returns Promise containing the species data or null if the request fails
   * @private Internal helper method
   */
  private async getPokemonSpeciesFromUrl(speciesUrl: string): Promise<any> {
    try {
      const speciesData = await this.http.get(speciesUrl).toPromise();
      return speciesData;
    } catch (error) {
      console.warn(`Error fetching species data from ${speciesUrl}`, error);
      return null;
    }
  }

  /**
   * Retrieves detailed information about a Pokémon ability.
   * 
   * @param abilityUrl The full URL to the ability resource
   * @returns Observable containing the ability data
   */
  getAbilityDetails(abilityUrl: string): Observable<any> {
    return this.http.get(abilityUrl);
  }
  
  /**
   * Retrieves detailed information about a Pokémon move.
   * 
   * @param moveUrl The full URL to the move resource
   * @returns Observable containing the move data
   */
  getMoveDetails(moveUrl: string): Observable<any> {
    return this.http.get(moveUrl);
  }
}
