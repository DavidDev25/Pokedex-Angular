import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="pokemon">
      <h2>{{ pokemon.name | titlecase }}</h2>
      <img [src]="pokemon.sprites.front_default" alt="{{ pokemon.name }}">
      <ul>
        <li *ngFor="let type of pokemon.types">
          {{ type.type.name }}
        </li>
      </ul>
      <h3>Abilities</h3>
    </div>
  `
})
export class PokemonDetailComponent implements OnInit {
  pokemon: any;
  private route = inject(ActivatedRoute);
  private pokemonService = inject(PokemonService);

  ngOnInit() {
    const name = this.route.snapshot.paramMap.get('name');
    if (name) {
      this.pokemonService.getPokemonByName(name).subscribe(data => {
        this.pokemon = data;
      });
    }
  }
}
