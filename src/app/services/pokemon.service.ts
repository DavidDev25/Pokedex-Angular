import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private http = inject(HttpClient);
  private apiUrl = 'https://pokeapi.co/api/v2';

  getPokemonList(offset = 0, limit = 20, language = 'en'): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon?offset=${offset}&limit=${limit}`)
      .pipe(
        switchMap((data: any) => {
          const pokemonList = data.results;
          const speciesRequests = pokemonList.map((pokemon: any) =>
            this.getPokemonSpecies(pokemon.name)
          );
          return Promise.all(speciesRequests).then(speciesData => {
            return {
              ...data,
              results: pokemonList.map((pokemon: any, index: number) => ({
                ...pokemon,
                speciesInfo: speciesData[index]
              }))
            };
          });
        })
      );
  }

  getPokemonByName(name: string, language = 'en'): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon/${name}`).pipe(
      switchMap(pokemonData => 
        this.getPokemonSpecies(name).then(speciesData => ({
          ...pokemonData,
          speciesInfo: speciesData
        }))
      )
    );
  }

  private async getPokemonSpecies(name: string): Promise<any> {
    const speciesData = await this.http.get(`${this.apiUrl}/pokemon-species/${name}`).toPromise();
    return speciesData;
  }
}
