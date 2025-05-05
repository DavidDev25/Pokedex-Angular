import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, forkJoin, of, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private http = inject(HttpClient);
  private apiUrl = 'https://pokeapi.co/api/v2';

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

  private async getPokemonSpeciesFromUrl(speciesUrl: string): Promise<any> {
    try {
      const speciesData = await this.http.get(speciesUrl).toPromise();
      return speciesData;
    } catch (error) {
      console.warn(`Error fetching species data from ${speciesUrl}`, error);
      return null;
    }
  }

  getAbilityDetails(abilityUrl: string): Observable<any> {
    return this.http.get(abilityUrl);
  }
  
  getMoveDetails(moveUrl: string): Observable<any> {
    return this.http.get(moveUrl);
  }
}
