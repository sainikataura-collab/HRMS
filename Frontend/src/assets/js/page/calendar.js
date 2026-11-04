document.addEventListener("DOMContentLoaded", function () {
  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    headerToolbar: {
      left: "prevYear,prev,next,nextYear today",
      center: "title",
      right: "dayGridMonth,dayGridWeek,dayGridDay",
    },
    initialDate: "2023-01-12",
    navLinks: true, // can click day/week names to navigate views
    editable: true,
    dayMaxEvents: true, // allow "more" link when too many events
    events: [
      {
        title: "Palak Jani",
        start: "2023-01-07",
        end: "2023-01-08",
        backgroundColor: "#00bcd4",
      },
      {
        title: "Priya Sarma",
        start: "2023-01-07",
        end: "2023-01-10",
        backgroundColor: "#fe9701",
      },
      {
        title: "John Doe",
        start: "2023-01-27",
        end: "2023-01-28",
        backgroundColor: "#F3565D",
      },
      {
        title: "Sarah Smith",
        start: "2023-01-21",
        end: "2023-01-23",
        backgroundColor: "#1bbc9b",
      },
      {
        title: "Airi Satou",
        start: "2023-01-24",
        end: "2023-01-25",
        backgroundColor: "#DC35A9",
      },
      {
        title: "Angelica Ramos",
        start: "2023-01-14",
        end: "2023-01-16",
        backgroundColor: "#fe9701",
      },
      {
        title: "Palak Jani",
        start: "2023-01-02",
        end: "2023-01-03",
        backgroundColor: "#00bcd4",
      },
      {
        title: "Priya Sarma",
        start: "2023-01-17",
        end: "2023-01-20",
        backgroundColor: "#9b59b6",
      },
      {
        title: "John Doe",
        start: "2023-01-11",
        end: "2023-01-13",
        backgroundColor: "#F3565D",
      },
      {
        title: "Mark Hay",
        start: "2023-01-04",
        end: "2023-01-5",
        backgroundColor: "#F3565D",
      },
    ],
  });

  calendar.render();
});
