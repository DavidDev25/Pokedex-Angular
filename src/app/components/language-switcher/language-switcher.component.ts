import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <button class="language-btn" (click)="toggleLanguage()">
      {{ (currentLang === 'en' ? 'LANGUAGE.SWITCH' : 'LANGUAGE.SWITCH_BACK') | translate }}
    </button>
  `,
  styleUrls: ['./language-switcher.component.sass'],
})
export class LanguageSwitcherComponent implements OnInit {
  currentLang = 'en';
  private translationService = inject(TranslationService);
  
  ngOnInit(): void {
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  toggleLanguage(): void {
    const newLang = this.currentLang === 'en' ? 'de' : 'en';
    this.translationService.switchLanguage(newLang);
  }
}