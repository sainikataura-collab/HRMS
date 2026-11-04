// Add this import for Bootstrap modal
declare var bootstrap: any;
import { Component } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions as FullCalendarOptions } from '@fullcalendar/core';
import { TrainingPlanningService } from '../../../all-dashboard/training/services/training-planning.service';
import { ProgramService } from '../../../all-dashboard/training/services/program.service';

@Component({
  selector: 'app-emp-training-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],

  templateUrl: './emp-training-calendar.component.html',
  styleUrl: './emp-training-calendar.component.scss'
})
export class EmpTrainingCalendarComponent {

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

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  constructor(private trainingPlanningService: ProgramService) { }

  ngOnInit(): void {
    this.loadScheduledTrainings();
  }


  loadScheduledTrainings() {
    this.trainingPlanningService.getTNI_list(this.pageIndex - 1, this.pageSize).subscribe(res => {
      if (res.isSuccess) {
        this.trainingData = res.data; // Load all data

        // Map data to calendar events
        this.calendarOptions.events = this.trainingData.map((t, index) => {
          // Set color based on status
          let eventColor = '#007bff'; // default blue
          if (t.status === 'Completed') eventColor = '#28a745'; // green for completed
          if (t.status === 'PL') eventColor = '#2841e0ff'; // yellow for in-progress (example)

          return {
            id: t.pk_TNIId,
            title: `${t.programName} - ${t.subProgramName}`,
            start: t.planningDateTime,
            backgroundColor: eventColor,
            borderColor: eventColor,
            textColor: '#ffffff',
            extendedProps: {
              trainer: t.trainer || '-',
              location: t.calendarLocation || '-',
              programName: t.programName,
              subProgramName: t.subProgramName,
              status: t.status,            // <-- status to show in box
              employeeNames: t.empName     // single or multiple names
            }
          };
        });

        // Customize event content to show status box
        // this.calendarOptions.eventContent = (arg: any) => {
        //   const event = arg.event;
        //   const status = event.extendedProps.status;

        //   const html = `
           
        //   <div class="fc-event-title">${event.title}</div>
        //   <div class="fc-event-status w-100 mx-auto" style="font-size:10px;  background:#f0f0f0; color:#333; padding:2px 2px; border-radius:3px; ">
        //     Status: ${status}          </div>
       
        // `;
        //   return { html };
        // };

this.calendarOptions.eventContent = (arg: any) => {
  const event = arg.event;
  const status = event.extendedProps.status;
  const isMobile = window.innerWidth <= 768;

  // Emoji icon map
  const statusIconMap: any = {
Completed: '✔️',
    Pending: '🕐',
    Cancelled: '🚫',
     Approved: '👍',
    Default: '📌'
  };

  const icon = statusIconMap[status] || statusIconMap.Default;

  // Mobile: show ONLY icon (no title)
  // Desktop: show title + status text
  const html = isMobile
    ? `
        <div class="fc-event-title d-flex align-items-center justify-content-center w-100">
          <span title="${event.title} - ${status}" style="font-size:20px;">${icon}</span>
        </div>
      `
    : `
        <div class="fc-event-title">${event.title}</div>
        <div class="fc-event-status w-100 mx-auto"
             style="font-size:10px; background:#f0f0f0; color:#333; padding:2px 2px; border-radius:3px;">
          Status: ${status}
        </div>
      `;

  // ✅ Return as actual DOM node (not sanitized HTML)
  const element = document.createElement('div');
  element.innerHTML = html;
  return { domNodes: [element] };
};



      }
    });
  }


  //   loadScheduledTrainings() {
  //   this.trainingPlanningService.getTNI_list(this.pageIndex-1, this.pageSize).subscribe(res => {
  //     if (res.isSuccess) {
  //       this.trainingData = res.data.filter((t: { status: string; }) => t.status === 'PL'); // Use correct status field

  //       this.calendarOptions.events = this.trainingData.map((t, index) => {
  //         const colorIndex = index % this.eventColors.length;
  //         const eventColor = this.eventColors[colorIndex];

  //         return {
  //           id: t.pk_TNIId,
  //           title: `${t.programName} - ${t.subProgramName}`,
  //           start: t.planningDateTime, // Use planningDateTime
  //           backgroundColor: eventColor,
  //           borderColor: eventColor,
  //           textColor: '#ffffff',
  //           extendedProps: {
  //             trainer: t.trainer || '-', // if trainer is null
  //             location: t.calendarLocation || '-',
  //             programName: t.programName,
  //             subProgramName: t.subProgramName,
  //             employeeNames: t.empName  // single name; if multiple, you can join
  //           }
  //         };
  //       });
  //     }
  //   });
  // }


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