import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions as FullCalendarOptions } from '@fullcalendar/core';
import { TrainingPlanningService } from '../../services/training-planning.service';

// 🔹 FullCalendar plugins
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Add this import for Bootstrap modal
declare var bootstrap: any;

@Component({
  selector: 'app-training-calendar-admin-view',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './training-calendar-admin-view.component.html',
  styleUrl: './training-calendar-admin-view.component.scss'
})
export class TrainingCalendarAdminViewComponent {

  calendarOptions: FullCalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    height: 'auto',
    contentHeight: 'auto',
    aspectRatio: 1.8,
    fixedWeekCount: false, // Don't always show 6 weeks
    showNonCurrentDates: true,
    dayMaxEvents: 3, // Show max 3 events, then "+more"
    moreLinkClick: 'popover',
    displayEventTime: true,
    eventDisplay: 'block',
    nowIndicator: true,
    navLinks: true, // Click day/week to navigate
    selectable: true,
    selectMirror: true,
    weekends: true,
    editable: false,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    // Google Calendar style colors
    eventColor: '#039BE5', // Default blue
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    },
    // First day of week (0 = Sunday, 1 = Monday)
    firstDay: 0,
    buttonText: {
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day'
    }
  };


  
  trainingData: any[] = [];

  // Google Calendar inspired colors
  private eventColors = [
    '#039BE5', // Blue
    '#7986CB', // Lavender
    '#33B679', // Green
    '#8E24AA', // Purple
    '#E67C73', // Red
    '#F6BF26', // Yellow
    '#F4511E', // Orange
    '#616161'  // Gray
  ];

  constructor(private trainingPlanningService: TrainingPlanningService) { }

  ngOnInit(): void {
    this.loadScheduledTrainings();
  }


  loadScheduledTrainings() {
    this.trainingPlanningService.get_trainingPlanning(0, 1000).subscribe(res => {
      if (res.isSuccess) {
        // this.trainingData = res.data.filter((t: { tniStatus: string; }) => t.tniStatus === 'PL');
         // ✅ Convert tniStatus string to array and check for 'PL'
         
      this.trainingData = res.data.filter((t: { tniStatus: string }) =>
        t.tniStatus?.split(',').map(s => s.trim()).includes('PL')
      );
        this.calendarOptions.events = this.trainingData.map((t, index) => {
          // Assign colors based on program or use rotation
          const colorIndex = index % this.eventColors.length;
          const eventColor = this.eventColors[colorIndex];

          return {
            id: t.calendarId,
            title: `${t.programName} - ${t.subProgramName}`,
            start: t.trainingDateTime ,
            backgroundColor: eventColor,
            borderColor: eventColor,
            textColor: '#ffffff',
            extendedProps: {
              trainer: t.trainer,
              location: t.location,
              programName: t.programName,
              subProgramName: t.subProgramName,
               employeeNames: t.employeeNames 
            }
          };
        });
      }
    });
  }

  selectedEvent: any;
  
handleEventClick(clickInfo: any) {
    this.selectedEvent = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      trainer: clickInfo.event.extendedProps.trainer,
      location: clickInfo.event.extendedProps.location,
      programName: clickInfo.event.extendedProps.programName,
      subProgramName: clickInfo.event.extendedProps.subProgramName,
       employeeNames: clickInfo.event.extendedProps.employeeNames // 🔹 Capture empName
    };

    // Open Bootstrap modal programmatically
    const modalElement = document.getElementById('eventModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }


 


 

}