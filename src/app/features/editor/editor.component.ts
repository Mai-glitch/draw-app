import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, signal, ViewChild, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoPipe } from '@jsverse/transloco';
import { DrawingStore } from '../../stores/drawing.store';
import { StorageService } from '../../core/services/storage.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import type { Drawing, DrawingTool, PathElement, TextElement } from '../../core/models/drawing.model';
import { DEFAULT_TOOL, FUNKY_COLORS, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from '../../core/models/drawing.model';

@Component({
  selector: 'app-editor',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslocoPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        
        <!-- Left: Back & Save -->
        <div class="flex items-center gap-2">
          <button 
            mat-icon-button 
            (click)="goBack()"
            [attr.aria-label]="'editor.back' | transloco"
          >
            <mat-icon>arrow_back</mat-icon>
          </button>
          
          <mat-form-field class="w-48" appearance="outline">
            <input 
              matInput 
              [(ngModel)]="drawingName" 
              [placeholder]="'editor.drawingName' | transloco"
              (blur)="saveDrawing()"
            />
          </mat-form-field>
        </div>

        <!-- Center: Tools -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Brush Tool -->
          <button 
            mat-icon-button
            [class.bg-primary-100]="currentTool().type === 'brush'"
            [class.dark:bg-primary-900]="currentTool().type === 'brush'"
            (click)="setTool('brush')"
            [attr.aria-label]="'editor.tools.brush' | transloco"
          >
            <mat-icon>brush</mat-icon>
          </button>

          <!-- Eraser Tool -->
          <button 
            mat-icon-button
            [class.bg-primary-100]="currentTool().type === 'eraser'"
            [class.dark:bg-primary-900]="currentTool().type === 'eraser'"
            (click)="setTool('eraser')"
            [attr.aria-label]="'editor.tools.eraser' | transloco"
          >
            <mat-icon>auto_fix_high</mat-icon>
          </button>

          <!-- Text Tool -->
          <button 
            mat-icon-button
            [class.bg-primary-100]="currentTool().type === 'text'"
            [class.dark:bg-primary-900]="currentTool().type === 'text'"
            (click)="setTool('text')"
            [attr.aria-label]="'editor.tools.text' | transloco"
          >
            <mat-icon>text_fields</mat-icon>
          </button>

          <!-- Image Upload -->
          <input 
            #imageInput
            type="file" 
            accept="image/*" 
            class="hidden" 
            (change)="onImageUpload($event)"
          />
          <button 
            mat-icon-button
            (click)="imageInput.click()"
            [attr.aria-label]="'editor.tools.image' | transloco"
          >
            <mat-icon>image</mat-icon>
          </button>

          <div class="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-2"></div>

          <!-- Brush Size -->
          <div class="flex items-center gap-2">
            <mat-icon class="text-slate-500">line_weight</mat-icon>
            <mat-slider min="1" max="50" step="1" class="w-24">
              <input matSliderThumb [(ngModel)]="brushSize" (valueChange)="updateBrushSize($event)">
            </mat-slider>
            <span class="text-sm text-slate-600 dark:text-slate-400 w-6">{{ brushSize() }}</span>
          </div>

          <div class="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-2"></div>

          <!-- Colors -->
          <div class="flex items-center gap-1 flex-wrap">
            @for (color of colors; track color) {
              <button
                class="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                [style.background-color]="color"
                [style.border-color]="currentTool().color === color ? '#000' : 'transparent'"
                [style.border-width.px]="currentTool().color === color ? 3 : 2"
                (click)="setColor(color)"
                [attr.aria-label]="'editor.color' | transloco: { color }"
              ></button>
            }
            <input 
              type="color" 
              [(ngModel)]="selectedColor"
              (change)="setColor(selectedColor())"
              class="w-8 h-8 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
              [attr.aria-label]="'editor.customColor' | transloco"
            />
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
          <button 
            mat-icon-button
            (click)="undo()"
            [disabled]="undoStack().length === 0"
            [attr.aria-label]="'editor.undo' | transloco"
          >
            <mat-icon>undo</mat-icon>
          </button>

          <button 
            mat-icon-button
            (click)="clearCanvas()"
            [attr.aria-label]="'editor.clear' | transloco"
          >
            <mat-icon>delete</mat-icon>
          </button>

          <button 
            mat-raised-button 
            color="primary"
            (click)="saveAndExit()"
          >
            <mat-icon class="mr-1">save</mat-icon>
            {{ 'editor.save' | transloco }}
          </button>
        </div>
      </div>

      <!-- Text Input Overlay -->
      @if (showTextInput()) {
        <div 
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          (click)="cancelTextInput()"
        >
          <div 
            class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-2xl max-w-md w-full mx-4"
            (click)="$event.stopPropagation()"
          >
            <h3 class="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
              {{ 'editor.addText' | transloco }}
            </h3>
            <mat-form-field class="w-full">
              <textarea 
                matInput 
                [(ngModel)]="textInput"
                [placeholder]="'editor.textPlaceholder' | transloco"
                rows="3"
              ></textarea>
            </mat-form-field>
            <div class="flex justify-end gap-2 mt-4">
              <button mat-button (click)="cancelTextInput()">
                {{ 'common.cancel' | transloco }}
              </button>
              <button mat-raised-button color="primary" (click)="confirmTextInput()">
                {{ 'common.add' | transloco }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Canvas Container -->
      <div class="flex-1 overflow-auto flex items-center justify-center p-4">
        <div 
          class="bg-white rounded-lg shadow-2xl overflow-hidden"
          [style.width.px]="canvasWidth()"
          [style.height.px]="canvasHeight()"
        >
          <canvas
            #canvas
            [width]="canvasWidth()"
            [height]="canvasHeight()"
            class="block cursor-crosshair"
            (mousedown)="startDrawing($event)"
            (mousemove)="draw($event)"
            (mouseup)="stopDrawing()"
            (mouseleave)="stopDrawing()"
            (touchstart)="startDrawingTouch($event)"
            (touchmove)="drawTouch($event)"
            (touchend)="stopDrawing()"
          ></canvas>
        </div>
      </div>
    </div>
  `
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageInput', { static: false }) imageInputRef!: ElementRef<HTMLInputElement>;

  protected readonly store = inject(DrawingStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly canvasWidth = signal(DEFAULT_CANVAS_WIDTH);
  readonly canvasHeight = signal(DEFAULT_CANVAS_HEIGHT);
  readonly drawingName = signal('Nouveau dessin');
  readonly currentTool = signal<DrawingTool>(DEFAULT_TOOL);
  readonly brushSize = signal(DEFAULT_TOOL.size);
  readonly selectedColor = signal(DEFAULT_TOOL.color);
  readonly colors = FUNKY_COLORS;
  readonly showTextInput = signal(false);
  readonly textInput = signal('');
  readonly textPosition = signal<{ x: number; y: number } | null>(null);
  readonly undoStack = signal<ImageData[]>([]);
  readonly redoStack = signal<ImageData[]>([]);

  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private currentPath: PathElement | null = null;
  private drawingId: string | null = null;
  private autoSaveInterval: number | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.drawingId = id;
      const drawing = this.storageService.getDrawingById(id);
      if (drawing) {
        this.drawingName.set(drawing.name);
        this.canvasWidth.set(drawing.width);
        this.canvasHeight.set(drawing.height);
        this.store.selectDrawing(drawing);
        
        if (drawing.dataUrl) {
          const img = new Image();
          img.onload = () => {
            if (this.ctx) {
              this.ctx.drawImage(img, 0, 0);
              this.saveState();
            }
          };
          img.src = drawing.dataUrl;
        }
      }
    }
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    
    if (this.ctx) {
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.saveState();
    }

    this.autoSaveInterval = window.setInterval(() => {
      this.saveDrawing();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  setTool(tool: DrawingTool['type']): void {
    this.currentTool.update(t => ({ ...t, type: tool }));
  }

  setColor(color: string): void {
    this.selectedColor.set(color);
    this.currentTool.update(t => ({ ...t, color }));
  }

  updateBrushSize(size: number): void {
    this.brushSize.set(size);
    this.currentTool.update(t => ({ ...t, size }));
  }

  private saveState(): void {
    if (this.ctx) {
      const imageData = this.ctx.getImageData(0, 0, this.canvasWidth(), this.canvasHeight());
      this.undoStack.update(stack => [...stack, imageData]);
      if (this.undoStack().length > 20) {
        this.undoStack.update(stack => stack.slice(1));
      }
    }
  }

  undo(): void {
    if (this.undoStack().length > 1 && this.ctx) {
      const currentState = this.undoStack()[this.undoStack().length - 1];
      this.redoStack.update(stack => [...stack, currentState]);
      this.undoStack.update(stack => stack.slice(0, -1));
      const previousState = this.undoStack()[this.undoStack().length - 1];
      this.ctx.putImageData(previousState, 0, 0);
    }
  }

  startDrawing(event: MouseEvent): void {
    if (!this.ctx || this.currentTool().type === 'text') return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.currentTool().type === 'text') {
      this.textPosition.set({ x, y });
      this.showTextInput.set(true);
      return;
    }

    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    
    if (this.currentTool().type === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.currentTool().color;
      this.ctx.lineWidth = this.currentTool().size;
    }
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing || !this.ctx) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing(): void {
    if (!this.isDrawing || !this.ctx) return;
    
    this.isDrawing = false;
    this.ctx.closePath();
    this.ctx.globalCompositeOperation = 'source-over';
    this.saveState();
  }

  startDrawingTouch(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.startDrawing(mouseEvent);
  }

  drawTouch(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.draw(mouseEvent);
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file && this.ctx) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (this.ctx) {
            const canvas = this.canvasRef.nativeElement;
            const scale = Math.min(
              canvas.width / img.width,
              canvas.height / img.height,
              1
            );
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;
            
            this.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            this.saveState();
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    
    input.value = '';
  }

  cancelTextInput(): void {
    this.showTextInput.set(false);
    this.textInput.set('');
    this.textPosition.set(null);
  }

  confirmTextInput(): void {
    if (!this.ctx || !this.textPosition() || !this.textInput().trim()) {
      this.cancelTextInput();
      return;
    }

    const { x, y } = this.textPosition()!;
    this.ctx.font = `${this.brushSize() * 3}px Inter, sans-serif`;
    this.ctx.fillStyle = this.currentTool().color;
    this.ctx.textBaseline = 'top';
    
    const lines = this.textInput().split('\n');
    let currentY = y;
    lines.forEach(line => {
      this.ctx!.fillText(line, x, currentY);
      currentY += this.brushSize() * 4;
    });

    this.saveState();
    this.cancelTextInput();
  }

  clearCanvas(): void {
    if (!this.ctx) return;

    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      data: {
        title: 'editor.clearTitle',
        message: 'editor.clearMessage',
        confirmText: 'common.clear',
        cancelText: 'common.cancel',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ctx!.clearRect(0, 0, this.canvasWidth(), this.canvasHeight());
        this.ctx!.fillStyle = '#ffffff';
        this.ctx!.fillRect(0, 0, this.canvasWidth(), this.canvasHeight());
        this.saveState();
      }
    });
  }

  saveDrawing(): void {
    if (!this.ctx) return;

    const canvas = this.canvasRef.nativeElement;
    const dataUrl = canvas.toDataURL();
    
    const thumbnailCanvas = document.createElement('canvas');
    const maxSize = 300;
    const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
    thumbnailCanvas.width = canvas.width * scale;
    thumbnailCanvas.height = canvas.height * scale;
    const thumbnailCtx = thumbnailCanvas.getContext('2d');
    
    if (thumbnailCtx) {
      thumbnailCtx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      const thumbnailDataUrl = thumbnailCanvas.toDataURL();

      if (this.drawingId) {
        const drawing = this.storageService.getDrawingById(this.drawingId);
        if (drawing) {
          const updatedDrawing: Drawing = {
            ...drawing,
            name: this.drawingName(),
            dataUrl,
            thumbnailDataUrl,
            updatedAt: Date.now()
          };
          this.store.saveDrawing(updatedDrawing);
        }
      } else {
        const newDrawing = this.store.createDrawing({
          name: this.drawingName(),
          dataUrl,
          thumbnailDataUrl,
          width: this.canvasWidth(),
          height: this.canvasHeight()
        });
        this.drawingId = newDrawing.id;
      }
    }
  }

  saveAndExit(): void {
    this.saveDrawing();
    this.showNotification('editor.saved');
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
