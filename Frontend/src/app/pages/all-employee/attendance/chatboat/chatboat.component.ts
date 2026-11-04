import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewChecked,
  OnDestroy,
  OnInit,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ChatboatService, ChatboatResponse } from '../Services/chatboat.service';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// A unified interface for all chat messages
interface ChatMessage {
  from: 'user' | 'bot';
  message: string | SafeHtml;
  timestamp: Date;
  type: 'text' | 'error' | 'table' | 'loading' | 'letter'; // Added 'letter' type
  // Optional properties for table data
  columns?: string[];
  data?: any[];
  // Optional properties for PDF download
  pdf_data?: string;
  filename?: string;
}

@Component({
  selector: 'app-chatboat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, SkeletonComponent],
  templateUrl: './chatboat.component.html',
  styleUrls: ['./chatboat.component.scss'],
})
export class ChatboatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatHistoryContainer', { static: false }) chatHistoryContainer!: ElementRef;

  // --- Component State ---
  prompt: string = '';
  chatHistory: ChatMessage[] = []; // This is now the single source of truth
  isProcessing: boolean = false;
  isThinking: boolean = false;

  // --- Suggestions ---
  filteredSuggestions: string[] = [];
  suggestions: string[] = [
    'Generate offer letter',
    'Show salary breakup',
    'Get payslip for June',
    'What are the holidays this month?',
    'Set a reminder',
    'Show my employee details',
    'Generate appointment letter',
    'Check leave balance',
  ];

  // --- Interactive Form State ---
  isInteractiveFormVisible = false;
  isAwaitingReminderDetails = false;
  letterContext: any = null;
  reminderContext: any = null;
  letterDetails: { [key: string]: string } = {};
  reminderDetails = {
    emp_code: '',
    reminder_date: '',
    custom_message: '',
  };

  // --- Internal Utilities ---
  private timeoutRef: any;
  private typingInterval: any;

  constructor(
    private chatService: ChatboatService,
    private sanitizer: DomSanitizer,
    private zone: NgZone
  ) {}

  // --- Lifecycle Hooks ---
  ngOnInit(): void {
    this.initializeChat();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    if (this.timeoutRef) clearTimeout(this.timeoutRef);
    if (this.typingInterval) clearInterval(this.typingInterval);
  }

  // --- Primary Chat Logic ---

  private initializeChat(): void {
    this.chatHistory.push({
      from: 'bot',
      message: 'Hello! I\'m your HR Assistant. How can I assist you today?',
      timestamp: new Date(),
      type: 'text'
    });
  }

  sendData() {
    const trimmedPrompt = this.prompt.trim();
    if (!trimmedPrompt || this.isProcessing) return;

    this.isThinking = true;
    this.isProcessing = true;
    this.prompt = '';
    this.filteredSuggestions = [];

    this.chatHistory.push({ from: 'user', message: trimmedPrompt, timestamp: new Date(), type: 'text' });
    
    const botMessage: ChatMessage = { from: 'bot', message: '', timestamp: new Date(), type: 'loading' };
    this.chatHistory.push(botMessage);

    this.chatService.sendPrompt(trimmedPrompt).subscribe({
      next: (res) => this.processApiResponse(res, botMessage),
      error: (err) => this.handleError(err, botMessage),
      complete: () => {
        this.isThinking = false;
        this.isProcessing = false;
      },
    });
  }

 private processApiResponse(res: ChatboatResponse, botMessage: ChatMessage): void {
  console.log("✅ API Response:", res);

  if (!res?.isSuccess) {
    botMessage.type = 'error';
    // Display error message instantly
    botMessage.message = `❌ Error: ${res?.message || 'Unknown error.'}`;
    return;
  }

  let responseData: any;
  try {
    // Safely parse the response data, as it might be a JSON string from the C# backend.
    if (typeof res.data === 'string' && res.data.trim().startsWith('{')) {
      responseData = JSON.parse(res.data);
    } else {
      responseData = res.data; // Could be null, an object, or a simple string
    }
  } catch (e) {
    responseData = res.data; // Treat as plain text if parsing fails
    console.warn("Could not parse response data:", e);
  }

  // --- Start of Updated Logic ---

  if (responseData?.type === 'clarification') {
      this.handleClarification(responseData);
      botMessage.type = 'text';
      // Display clarification message instantly
      botMessage.message = responseData.message || "Please provide more details.";

  } else if (responseData?.type === 'table') {
      // --- FIX: Handle empty table data explicitly ---
      if (responseData.data && responseData.data.length > 0) {
        botMessage.type = 'table';
        botMessage.columns = responseData.columns || [];
        botMessage.data = responseData.data;
        // Ensure message is cleared for table type
        botMessage.message = ''; 
      } else {
        // If data is empty or null, show a text message instead
        botMessage.type = 'text';
        botMessage.message = "No records found matching your query.";
      }
      // --- END FIX ---

  } else if (responseData?.type === 'letter') {
      botMessage.type = 'letter';
      // Display letter content instantly
      botMessage.message = this.sanitizer.bypassSecurityTrustHtml(
           (responseData.result || "Letter generated.").replace(/\n/g, '<br>')
      );
      // Add PDF data for the download button (handled in HTML)
      botMessage.pdf_data = responseData.pdf_data;
      botMessage.filename = responseData.filename;

  } else if (responseData?.type === 'success') {
      botMessage.type = 'text';
      const successMessage = responseData.message || "Task completed successfully.";
      // Display success message instantly (no typing)
      botMessage.message = successMessage;

  } else {
      // Handle other cases (e.g., simple string response or empty data)
      botMessage.type = 'text';
      let messageText = "Task completed."; // Default fallback

      if (typeof responseData === 'string' && responseData.trim()) {
          messageText = responseData;
      } else if (typeof res.message === 'string' && res.message.trim() && res.message !== "Response received.") {
           messageText = res.message; // Use top-level message if relevant
      } else if (res.result && typeof res.result === 'string' && res.result.trim()){
           messageText = res.result; // Fallback to result if available
      }

      // Display final fallback message instantly
      botMessage.message = messageText;
  }
  // --- End of Updated Logic ---
}



  private handleClarification(responseData: any): void {
    this.zone.run(() => {
        if (responseData.letter_type) {
          this.letterContext = {
              letter_type: responseData.letter_type,
              needed_details: responseData.needed_details || []
          };
          this.isInteractiveFormVisible = true;
          this.isAwaitingReminderDetails = false;
        } else if (responseData.reminder_type) {
          this.reminderContext = {
            reminder_type: responseData.reminder_type
          };
          this.isAwaitingReminderDetails = true;
          this.isInteractiveFormVisible = true;
          this.letterContext = null;
        }
    });
  }

  // --- Form Submission Logic ---

  submitLetterDetails(): void {
    const payload = { 
      prompt: "generate letter details",
      letter_type: this.letterContext?.letter_type,
      details: this.letterDetails
    };
    const userMessageText = `Submitting letter details for: ${payload.letter_type}`;
    
    this.chatHistory.push({ from: 'user', message: userMessageText, timestamp: new Date(), type: 'text' });
    const botMessage: ChatMessage = { from: 'bot', message: '', timestamp: new Date(), type: 'loading' };
    this.chatHistory.push(botMessage);

    this.isProcessing = true;
    this.isThinking = true;
    this.cancelInteractiveForm();

    this.chatService.processLetterRequest(payload).subscribe({
      next: (res) => this.processApiResponse(res, botMessage),
      error: (err) => this.handleError(err, botMessage),
      complete: () => {
        this.isProcessing = false;
        this.isThinking = false;
      }
    });
  }

  submitReminderDetails(): void {
    const payload = { 
      prompt: "set reminder details",
      reminder_type: this.reminderContext?.reminder_type,
      emp_code: this.reminderDetails.emp_code,
      reminder_date: this.reminderDetails.reminder_date,
      custom_message: this.reminderDetails.custom_message,
      
    };
    const userMessageText = `Setting reminder for employee: ${payload.emp_code}`;

    this.chatHistory.push({ from: 'user', message: userMessageText, timestamp: new Date(), type: 'text' });
    const botMessage: ChatMessage = { from: 'bot', message: '', timestamp: new Date(), type: 'loading' };
    this.chatHistory.push(botMessage);

    this.isProcessing = true;
    this.isThinking = true;
    this.cancelInteractiveForm();

    this.chatService.processReminderRequest(payload).subscribe({
      next: (res) => this.processApiResponse(res, botMessage),
      error: (err) => this.handleError(err, botMessage),
      complete: () => {
        this.isProcessing = false;
        this.isThinking = false;
      }
    });
  }

  cancelInteractiveForm(): void {
    this.isInteractiveFormVisible = false;
    this.isAwaitingReminderDetails = false;
    this.letterContext = null;
    this.reminderContext = null;
    this.letterDetails = {};
    this.reminderDetails = { emp_code: '', reminder_date: '', custom_message: '' };
    this.isProcessing = false;
    this.isThinking = false;
  }

  // --- Error Handling & UI ---

  handleError(error: any, botMessage: ChatMessage): void {
    this.isProcessing = false;
    this.isThinking = false;
    botMessage.type = 'error';
    const detail = error.error?.detail || error.message;
    switch (error.status) {
      case 404: botMessage.message = `❌ Not Found: The API endpoint was not found.`; break;
      case 500: botMessage.message = '⚙️ A server error occurred. Please try again later.'; break;
      default: botMessage.message = `❌ Error ${error.status}: ${detail || 'An unknown error occurred.'}`;
    }
  }

  onInputChange(): void {
    const input = this.prompt.toLowerCase().trim();
    if (input.length === 0) {
      this.filteredSuggestions = [];
      if (this.timeoutRef) clearTimeout(this.timeoutRef);
      return;
    }

    this.filteredSuggestions = this.suggestions
      .filter(s => s.toLowerCase().includes(input))
      .slice(0, 5);

    if (this.timeoutRef) clearTimeout(this.timeoutRef);
    if (this.filteredSuggestions.length > 0) {
      this.timeoutRef = setTimeout(() => {
        this.filteredSuggestions = [];
      }, 15000);
    }
  }

  selectSuggestion(suggestion: string): void {
    this.prompt = suggestion;
    this.filteredSuggestions = [];
    if (this.timeoutRef) clearTimeout(this.timeoutRef);
    this.sendData();
  }

  clearChat(): void {
    this.chatHistory = [];
    this.cancelInteractiveForm();
    this.initializeChat();
  }

  // --- Utility & Formatting ---

  /**
   * Triggers a file download for the Base64 encoded PDF data.
   */
  downloadPdf(pdfData: string | undefined, filename: string | undefined): void {
    if (!pdfData || !filename) return;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdfData}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  animateTyping(text: string, messageObj: ChatMessage): void {
    if (!text) {
      messageObj.message = '';
      return;
    }
    messageObj.message = '';
    let index = 0;
    if (this.typingInterval) clearInterval(this.typingInterval);

    this.zone.runOutsideAngular(() => {
      this.typingInterval = setInterval(() => {
        if (index < text.length) {
          const currentMessage = messageObj.message as string;
          messageObj.message = currentMessage + text.charAt(index);
          index++;
        } else {
          clearInterval(this.typingInterval);
        }
      }, 20);
    });
  }
  
  scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.chatHistoryContainer?.nativeElement) {
          const element = this.chatHistoryContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
        }
      } catch (err) {
        console.error('Auto-scroll failed:', err);
      }
    }, 100);
  }

  getIconClass(item: ChatMessage): string {
    return item.from === 'bot' ? 'fa-robot text-success' : 'fa-user-circle text-primary';
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();
      this.clearChat();
    }
    if (event.key === 'Escape' && this.isInteractiveFormVisible) {
      this.cancelInteractiveForm();
    }
  }
}

