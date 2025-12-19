/**
 * SortableList Utility
 * Reusable HTML5 Drag & Drop sorting for lists.
 * Supports multiple instances on the same container using unique instance IDs.
 */

let instanceCounter = 0;

export interface SortableOptions {
  itemSelector: string;
  handleSelector?: string | null;
  draggingClass?: string;
  dragOverClass?: string;
  onSort?: (fromIndex: number, toIndex: number, element: HTMLElement) => void;
  dataKey?: string;
}

export class SortableList {
  private container: HTMLElement;
  private instanceId: string;
  private options: Required<SortableOptions>;
  private draggedItem: HTMLElement | null = null;
  private draggedIndex: number | null = null;
  private mouseDownOnHandle = false;

  constructor(container: HTMLElement, options: SortableOptions) {
    this.container = container;
    this.instanceId = `sortable-${++instanceCounter}`;
    this.options = {
      itemSelector: options.itemSelector,
      handleSelector: options.handleSelector || null,
      draggingClass: options.draggingClass || "is-dragging",
      dragOverClass: options.dragOverClass || "drag-over",
      onSort: options.onSort || (() => {}),
      dataKey: options.dataKey || "index",
    };

    this.init();
  }

  private init(): void {
    if (this.options.handleSelector) {
      this.container.addEventListener("mousedown", this.handleMouseDown.bind(this));
      this.container.addEventListener("mouseup", this.handleMouseUp.bind(this));
    }

    this.container.addEventListener("dragstart", this.handleDragStart.bind(this));
    this.container.addEventListener("dragend", this.handleDragEnd.bind(this));
    this.container.addEventListener("dragover", this.handleDragOver.bind(this));
    this.container.addEventListener("dragleave", this.handleDragLeave.bind(this));
    this.container.addEventListener("drop", this.handleDrop.bind(this));
  }

  private handleMouseDown(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    this.mouseDownOnHandle = !!target.closest(this.options.handleSelector!);
  }

  private handleMouseUp(): void {
    this.mouseDownOnHandle = false;
  }

  private getItem(target: HTMLElement): HTMLElement | null {
    return target.closest(this.options.itemSelector);
  }

  private getIndex(item: HTMLElement): number {
    return parseInt(item.dataset[this.options.dataKey] || "0", 10);
  }

  private handleDragStart(e: DragEvent): void {
    const item = this.getItem(e.target as HTMLElement);

    if (!item) return;

    if (this.options.handleSelector && !this.mouseDownOnHandle) {
      e.preventDefault();
      return;
    }

    this.draggedItem = item;
    this.draggedIndex = this.getIndex(item);

    item.classList.add(this.options.draggingClass);
    
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", this.draggedIndex.toString());
      e.dataTransfer.setData(`application/x-sortable-${this.instanceId}`, this.draggedIndex.toString());
    }

    e.stopPropagation();
  }

  private handleDragEnd(): void {
    if (this.draggedItem) {
      this.draggedItem.classList.remove(this.options.draggingClass);
    }

    this.container.querySelectorAll(`.${this.options.draggingClass}`).forEach((el) => {
      el.classList.remove(this.options.draggingClass);
    });

    this.container.querySelectorAll(`.${this.options.dragOverClass}`).forEach((el) => {
      el.classList.remove(this.options.dragOverClass);
    });

    this.draggedItem = null;
    this.draggedIndex = null;
    this.mouseDownOnHandle = false;
  }

  private handleDragOver(e: DragEvent): void {
    if (this.draggedItem === null) return;

    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }

    const item = this.getItem(e.target as HTMLElement);

    if (item && item !== this.draggedItem) {
      const index = this.getIndex(item);
      if (index !== this.draggedIndex) {
        this.container.querySelectorAll(`.${this.options.dragOverClass}`).forEach((el) => {
          if (el !== item) el.classList.remove(this.options.dragOverClass);
        });
        item.classList.add(this.options.dragOverClass);
      }
    }
  }

  private handleDragLeave(e: DragEvent): void {
    if (this.draggedItem === null) return;

    const item = this.getItem(e.target as HTMLElement);
    if (item && !item.contains(e.relatedTarget as Node)) {
      item.classList.remove(this.options.dragOverClass);
    }
  }

  private handleDrop(e: DragEvent): void {
    if (this.draggedItem === null || this.draggedIndex === null) return;

    e.preventDefault();
    e.stopPropagation();

    const item = this.getItem(e.target as HTMLElement);
    if (!item) return;

    const targetIndex = this.getIndex(item);

    if (targetIndex !== this.draggedIndex) {
      this.options.onSort(this.draggedIndex, targetIndex, item);
    }
  }

  public destroy(): void {
    this.container.removeEventListener("mousedown", this.handleMouseDown);
    this.container.removeEventListener("mouseup", this.handleMouseUp);
    this.container.removeEventListener("dragstart", this.handleDragStart);
    this.container.removeEventListener("dragend", this.handleDragEnd);
    this.container.removeEventListener("dragover", this.handleDragOver);
    this.container.removeEventListener("dragleave", this.handleDragLeave);
    this.container.removeEventListener("drop", this.handleDrop);
  }

  static initialize(container: HTMLElement & { _sortableInitialized?: boolean }): void {
    if (!container || container._sortableInitialized) return;
    container._sortableInitialized = true;

    const itemSelector = container.dataset.itemSelector || "[draggable]";
    const handleSelector = container.dataset.handleSelector || null;
    const dataKey = container.dataset.dataKey || "index";

    new SortableList(container, {
      itemSelector,
      handleSelector,
      dataKey,
      onSort: (from, to, el) => {
        container.dispatchEvent(new CustomEvent("sortable:sort", {
          bubbles: true,
          detail: { from, to, element: el }
        }));
      }
    });
  }
}

export default SortableList;
