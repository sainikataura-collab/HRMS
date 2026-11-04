import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AtsService, JobBoardMaster } from '../../../../shared/services/ats.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-job-boards-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-boards-manager.component.html',
  styleUrl: './job-boards-manager.component.scss'
})
export class JobBoardsManagerComponent implements OnInit {
  jobBoards: JobBoardMaster[] = [];
  selectedBoard: JobBoardMaster | null = null;
  showConfigModal = false;
  showAddBoardModal = false;

  selectedCategory: string = 'All';
  searchQuery: string = '';
  categories: string[] = ['All'];

  newBoard: JobBoardMaster = {
    boardId: '',
    boardName: '',
    category: 'General',
    iconName: 'public',
    colorClass: '#3080e8',
    isActive: true,
    isConfigured: false,
    apiKey: '',
    secretKey: '',
    syndicationUrl: '',
    totalPostings: 0,
    totalSourcedCandidates: 0
  };

  constructor(
    private atsService: AtsService,
    private toastr: ToastrService,
    private loaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.loadJobBoards();
  }

  loadJobBoards(): void {
    this.loaderService.start();
    this.atsService.getJobBoards().subscribe({
      next: (data) => {
        this.loaderService.stop();
        this.jobBoards = data;
        const uniqueCats = Array.from(new Set(data.map(b => b.category))).filter(Boolean);
        this.categories = ['All', ...uniqueCats];
      },
      error: (err) => {
        this.loaderService.stop();
        console.error('Error loading job boards', err);
      }
    });
  }

  get filteredBoards(): JobBoardMaster[] {
    return this.jobBoards.filter(b => {
      const matchCat = this.selectedCategory === 'All' || b.category === this.selectedCategory;
      const matchSearch = !this.searchQuery.trim() || 
        b.boardName.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        b.category.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  toggleBoard(board: JobBoardMaster): void {
    const newState = !board.isActive;
    board.isActive = newState;
    this.atsService.toggleJobBoardStatus(board.boardId, newState).subscribe({
      next: () => {
        if (newState) {
          this.toastr.success(`Channel "${board.boardName}" is now Active.`, '⚡ Syndication Enabled');
        } else {
          this.toastr.warning(`Channel "${board.boardName}" is now Inactive.`, '🛑 Syndication Disabled');
        }
      },
      error: (err) => {
        console.warn('Error toggling board status:', err);
      }
    });
  }

  openConfigModal(board: JobBoardMaster): void {
    this.selectedBoard = { ...board };
    this.showConfigModal = true;
  }

  closeConfigModal(): void {
    this.showConfigModal = false;
    this.selectedBoard = null;
  }

  saveConfig(): void {
    if (this.selectedBoard) {
      this.loaderService.start();
      this.atsService.saveJobBoard(this.selectedBoard).subscribe({
        next: () => {
          this.loaderService.stop();
          this.loadJobBoards();
          this.closeConfigModal();
        },
        error: () => {
          this.loaderService.stop();
        }
      });
    }
  }

  openAddBoardModal(): void {
    this.newBoard = {
      boardId: '',
      boardName: '',
      category: 'Custom Portal',
      iconName: 'public',
      colorClass: '#3080e8',
      isActive: true,
      isConfigured: false,
      apiKey: '',
      secretKey: '',
      syndicationUrl: '',
      totalPostings: 0,
      totalSourcedCandidates: 0
    };
    this.showAddBoardModal = true;
  }

  closeAddBoardModal(): void {
    this.showAddBoardModal = false;
  }

  saveNewBoard(): void {
    if (this.newBoard.boardName) {
      this.loaderService.start();
      this.atsService.saveJobBoard(this.newBoard).subscribe({
        next: () => {
          this.loaderService.stop();
          this.loadJobBoards();
          this.closeAddBoardModal();
        },
        error: () => {
          this.loaderService.stop();
        }
      });
    }
  }

  getTotalActiveChannels(): number {
    return this.jobBoards.filter(b => b.isActive).length;
  }

  getTotalCandidatesSourced(): number {
    return this.jobBoards.reduce((acc, curr) => acc + (curr.totalSourcedCandidates || 0), 0);
  }

  getTotalPostings(): number {
    return this.jobBoards.reduce((acc, curr) => acc + (curr.totalPostings || 0), 0);
  }
}
