import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, forkJoin, of } from 'rxjs';

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

  getAbilityDetails(abilityUrl: string): Observable<any> {
    return this.http.get(abilityUrl);
  }
  
  getMoveDetails(moveUrl: string): Observable<any> {
    return this.http.get(moveUrl);
  }
  
  getLocalizedAbilityName(ability: any, language: string): Observable<string> {
    return this.getAbilityDetails(ability.ability.url).pipe(
      map(details => {
        const localizedName = details.names.find((name: any) => name.language.name === language);
        return localizedName ? localizedName.name : ability.ability.name;
      })
    );
  }
  
  getLocalizedMoveName(move: any, language: string): Observable<string> {
    return this.getMoveDetails(move.move.url).pipe(
      map(details => {
        const localizedName = details.names.find((name: any) => name.language.name === language);
        return localizedName ? localizedName.name : move.move.name;
      })
    );
  }
  
  getLocalizedName(pokemon: any, language: string): string {
    const names = pokemon.speciesInfo?.names || [];
    const localizedName = names.find((name: any) => name.language.name === language);
    return localizedName ? localizedName.name : pokemon.name;
  }

  getLocalizedTypes(pokemon: any, language: string): string[] {
    return pokemon.types.map((type: any) => type.type.name);
  }
  
  getLocalizedPokemonDetails(pokemon: any, language: string): Observable<any> {
    pokemon.localizedName = this.getLocalizedName(pokemon, language);
    pokemon.localizedTypes = this.getLocalizedTypes(pokemon, language);
    
    const abilityRequests = pokemon.abilities.map((ability: any) => 
      this.getLocalizedAbilityName(ability, language).pipe(
        map(name => ({ ...ability, localizedName: name }))
      )
    );
    
    const moveRequests = pokemon.moves.slice(0, 5).map((move: any) => 
      this.getLocalizedMoveName(move, language).pipe(
        map(name => ({ ...move, localizedName: name }))
      )
    );
    
    if (abilityRequests.length === 0) return of(pokemon);
    
    return forkJoin([
      forkJoin(abilityRequests || [of([])]), 
      forkJoin(moveRequests || [of([])])
    ]).pipe(
      map(([abilities, moves]) => {
        return {
          ...pokemon,
          abilities: abilities,
          localizedMoves: moves
        };
      })
    );
  }
}
