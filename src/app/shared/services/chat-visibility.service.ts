import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatVisibilityService {
  private readonly STORAGE_KEY = 'support-chat-visible';
  chatVisible = signal<boolean>(this.loadVisibility());

  private loadVisibility(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored !== null ? JSON.parse(stored) : true;
  }

  toggleChatVisibility(): void {
    this.chatVisible.update(v => !v);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.chatVisible()));
  }

  showChat(): void {
    this.chatVisible.set(true);
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  hideChat(): void {
    this.chatVisible.set(false);
    localStorage.setItem(this.STORAGE_KEY, 'false');
  }
}
