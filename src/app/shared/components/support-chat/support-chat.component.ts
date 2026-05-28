import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ChatVisibilityService } from '../../services/chat-visibility.service';
import { UserService } from '../../../core/services/user.service';
import { MatTooltipModule } from '@angular/material/tooltip';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

@Component({
  selector: 'support-chat',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule, MatTooltipModule],
  templateUrl: './support-chat.component.html',
  styleUrl: './support-chat.component.scss',
})
export class SupportChatComponent {
  private chatVisibilityService = inject(ChatVisibilityService);
  private userService = inject(UserService);
  isOpen = signal(false);
  selectedFaqId = signal<number | null>(null);
  chatVisible = this.chatVisibilityService.chatVisible;
  isAuthenticated = () => this.userService.currentUser() !== null;

  faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'How do I export a report?',
      answer: 'Click the Export button on any list page, select your desired format (PDF or CSV), choose whether to export all items or apply filters, and the file will download automatically.',
    },
    {
      id: 2,
      question: 'What permissions do I need to export data?',
      answer: 'Admin users can export all data. Department Responsible users can export their department\'s data. Regular employees can only export their own data.',
    },
    {
      id: 3,
      question: 'How do I add a comment to a complaint?',
      answer: 'Open the complaint details, scroll to the comments section, type your comment in the text field, and click "Post Comment".',
    },
    {
      id: 4,
      question: 'How do I change the status of a complaint?',
      answer: 'Open the complaint, use the status dropdown near the top to select a new status, and click "Update". The status will change immediately.',
    },
    {
      id: 5,
      question: 'Can I filter by multiple criteria?',
      answer: 'Yes, you can combine multiple filters (search, status, category, department) on any list page. The filters work together to narrow down results.',
    },
    {
      id: 6,
      question: 'How do I view my recent items?',
      answer: 'Your recent items appear in the sidebar. Complaints, requests, and assets you\'ve recently viewed are automatically tracked and displayed for quick access.',
    },
    {
      id: 7,
      question: 'How do I request an asset?',
      answer: 'Go to the Requests page, click "New", select the assets you need from the available options, and submit. Your request will be pending approval until a manager approves it.',
    },
  ];

  toggleChat(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.selectedFaqId.set(null);
    }
  }

  selectFaq(id: number): void {
    this.selectedFaqId.update(current => (current === id ? null : id));
  }

  getSelectedFaq(): FAQItem | undefined {
    const id = this.selectedFaqId();
    return id ? this.faqItems.find(item => item.id === id) : undefined;
  }

  closeChat(): void {
    this.isOpen.set(false);
    this.selectedFaqId.set(null);
  }

  hideChat(): void {
    this.isOpen.set(false);
    this.selectedFaqId.set(null);
    this.chatVisibilityService.hideChat();
  }
}
