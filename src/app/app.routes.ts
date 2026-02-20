import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
    pathMatch: 'full'
  },
  {
    path: 'editor',
    loadComponent: () => import('./features/editor/editor.component').then(m => m.EditorComponent)
  },
  {
    path: 'editor/:id',
    loadComponent: () => import('./features/editor/editor.component').then(m => m.EditorComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
