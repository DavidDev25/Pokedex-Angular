import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject } from "rxjs";
import { inject, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class TranslationService {
    private currentLangSubject = new BehaviorSubject<string>('en');
    public currentLang$ = this.currentLangSubject.asObservable();
  
    constructor(private translate: TranslateService) {
  
      translate.setDefaultLang('en');
      translate.use('en');
    }
  
    switchLanguage(lang: string): void {
      this.translate.use(lang);
      this.currentLangSubject.next(lang);
    }
  }