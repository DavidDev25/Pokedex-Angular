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
  styles: [`
    .language-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 8px 16px;
      background-color: #3B4CCA;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: background-color 0.3s;
      z-index: 1001;
    }
    
    .language-btn:hover {
      background-color: #2a3a99;
    }
  `]
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