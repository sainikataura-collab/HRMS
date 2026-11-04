import { Component, ElementRef, ViewChild, OnInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollMe') private chatScrollContainer!: ElementRef;

  isOpen: boolean = false;
  isTyping: boolean = false;
  newMessage: string = '';
  
  messages: ChatMessage[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadChatHistory();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  getStorageKey(): string {
    const candidateKey = sessionStorage.getItem('candidateKey') || 'Unknown';
    return 'chatHistory_' + candidateKey;
  }

  saveChatHistory(): void {
    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(this.messages));
  }

  loadChatHistory(): void {
    const key = this.getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        this.messages = JSON.parse(saved);
        return;
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    
    // Initial welcome message if no history exists
    this.messages.push({
      text: 'Hello! I am your AI Onboarding Assistant. How can I help you with your onboarding today?',
      sender: 'bot',
      timestamp: new Date()
    });
    this.saveChatHistory();
  }

  clearChat(): void {
    localStorage.removeItem(this.getStorageKey());
    this.messages = [];
    this.loadChatHistory();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const userText = this.newMessage.trim();
    
    // Add user message
    this.messages.push({
      text: userText,
      sender: 'user',
      timestamp: new Date()
    });
    this.saveChatHistory();

    this.newMessage = '';
    setTimeout(() => this.scrollToBottom(), 100);
    this.isTyping = true;

    // Call backend API
    const candidateKey = sessionStorage.getItem('candidateKey') || '';
    const url = environment.baseURL1 + '/CandidateExperienceDetails/chatbot/ask?key=' + candidateKey;
    
    this.http.post<any>(url, { question: userText, candidateName: sessionStorage.getItem('candidateName') || 'Candidate', candidateKey: sessionStorage.getItem('candidateKey') || 'Unknown', agentName: sessionStorage.getItem('agentName') || 'Dinesh' }).subscribe({
      next: (res) => {
        this.isTyping = false;
        this.messages.push({
          text: res.answer || "I'm sorry, I didn't understand that.",
          sender: 'bot',
          timestamp: new Date()
        });
        this.saveChatHistory();
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        this.isTyping = false;
        this.messages.push({
          text: "Oops! My backend AI connection is currently offline. Please configure the OpenAI API key on the server.",
          sender: 'bot',
          timestamp: new Date()
        });
        this.saveChatHistory();
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}
