import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

/**
 * Application configuration for the Pokedex Angular application.
 * 
 * This configuration defines the core providers needed for the application:
 * - Router configuration using the defined routes
 * - HTTP client for making API requests to the Pokemon API
 * 
 * @remarks
 * This uses the standalone API configuration approach introduced in Angular 14+
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Provides the router functionality with the routes defined in app.routes.ts
     */
    provideRouter(routes),
    
    /**
     * Provides the HttpClient service for making API requests
     * Used throughout the application to fetch Pokemon data
     */
    provideHttpClient()
  ]
};