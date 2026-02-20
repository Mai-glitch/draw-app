import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe } from '@jsverse/transloco';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 max-w-md">
      <h2 
        mat-dialog-title 
        class="text-xl font-bold mb-2"
        [class.text-slate-900]="true"
      >
        {{ data.title | transloco }}
      </h2>
      
      <mat-dialog-content class="text-slate-600 mb-4">
        {{ data.message | transloco }}
      </mat-dialog-content>

      <mat-dialog-actions class="flex justify-end gap-2">
        <button 
          mat-button 
          (click)="onCancel()"
          class="px-4 py-2"
        >
          {{ data.cancelText | transloco }}
        </button>
        <button 
          mat-raised-button
          [color]="data.confirmColor || 'primary'"
          (click)="onConfirm()"
          class="px-4 py-2"
        >
          {{ data.confirmText | transloco }}
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
