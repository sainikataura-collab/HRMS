import { CommonModule } from '@angular/common';
import { Component ,Inject, NgZone, PLATFORM_ID} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

@Component({
  selector: 'app-emp-recruitment-dash',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emp-recruitment-dash.component.html',
  styleUrl: './emp-recruitment-dash.component.scss'
})
export class EmpRecruitmentDashComponent {


  searchText: string = '';
  showAll: boolean = false;


  
  private root!: am5.Root; // Chart root

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private ngxUILoaderService: NgxUiLoaderService
  ) {}

  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngAfterViewInit() {
    this.browserOnly(() => {
      let chartDiv = document.getElementById('chartdiv');
      if (!chartDiv) {
        console.error("Chart container not found!");
        return;
      }
  
      this.root = am5.Root.new('chartdiv');
      this.root.setThemes([am5themes_Animated.new(this.root)]);
  
      // Create Radial Bar Chart
      let chart = this.root.container.children.push(
        am5percent.PieChart.new(this.root, {
          layout: this.root.verticalLayout,
          innerRadius: am5.percent(50) // Creates the radial effect
        })
      );
  
      let series = chart.series.push(
        am5percent.PieSeries.new(this.root, {
          valueField: 'value',
          categoryField: 'category',
          innerRadius: am5.percent(60), // Leaves space inside
          endAngle: 360
        })
      );
  
      // **Modern color styling**
      series.set(
        'colors',
        am5.ColorSet.new(this.root, {
          colors: [
            am5.color(0x3080e8), // Primary blue
            am5.color(0xe35b5d), // Deep purple
            am5.color(0x54ca68), // Muted blue
            am5.color(0x54ca68), // Warm orange
            am5.color(0xe35b5d), // Vivid red
            am5.color(0xffa446)  // Gold
          ]
        })
      );
  
      // **Custom slice styling for a modern look**
      series.slices.template.setAll({
        strokeWidth: 5, // Thick border
        stroke: am5.color(0xffffff), // White stroke for clean separation
        cornerRadius: 50, // Soft rounded edges
        shadowOpacity: 0.3, // Light shadow for depth
        shadowOffsetX: 5,
        shadowOffsetY: 5
      });
  
      // **Data**
      series.data.setAll([
        // { category: 'Orders', value: 500 },
        { category: 'Pending', value: 120 },
        { category: 'Reject', value: 80 },
        { category: 'Success', value: 50 }
      ]);
  
      // **Modern label styling**
      series.labels.template.setAll({
        text: "{category} {value}", // Show category & percentage
        fontSize: 13,
        fontWeight: "500",
        fill: am5.color(0x2b2e41) // White text
      });
  
      // **Add legend**
      let legend = chart.children.push(
        am5.Legend.new(this.root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
          marginTop: 20,
          marginBottom: 20
        })
      );
  
      legend.markerRectangles.template.adapters.add('fillGradient', () => undefined);
      legend.data.setAll(series.dataItems);
  
      series.appear(1200, 100);
    });
  }
  
  

  ngOnDestroy() {
    this.browserOnly(() => {
      if (this.root) {
        this.root.dispose();
        this.root = undefined as any;
      }
    });
  }

  ngOnInit() {
    this.ngxUILoaderService.start();
    setTimeout(() => this.ngxUILoaderService.stop(), 1000);
  }


  candidatePipelineList = [
    {
      id: 1,
      name: 'IT Department',
      position: 'Frontend Developer',
      interviewDate: '2025-05-10',
      plateform: 'Naukri.com',
       location: 'Noida',
      managerStatus: 'Pending',
    todoAction: 'HTML, CSS, Javascript, Angular , MYSQL, Bootstrap, Tailwind, Typescript',
     Salary: '8LPA'
    },
    {
      id: 2,
      name: 'IT Department',
      position: 'Backend Developer',
      interviewDate: '2025-05-08',
      plateform: 'LinkedIn',
       location: 'Noida',
      managerStatus: 'Approved',
      todoAction: 'HTML, CSS, Javascript, Angular , MYSQL, Bootstrap, Tailwind, Typescript',
       Salary: '9LPA'
    },
    {
      id: 3,
      name: 'It depatment',
      position: 'UI/UX Designer',
      interviewDate: '2025-05-12',
      plateform: 'Indeed',
       location: 'Noida',
      managerStatus: 'Rejected',
      todoAction: 'HTML, CSS, Javascript, Angular , MYSQL, Bootstrap, Tailwind, Typescript',
       Salary: '15LPA'
    },
    {
      id: 4,
      name: 'IT Department',
      position: 'QA Engineer',
      interviewDate: '2025-05-15',
      plateform: 'Shine.com',
       location: 'Delhi',
      managerStatus: 'Pending',
 todoAction: 'HTML, CSS, Javascript, Angular , MYSQL, Bootstrap, Tailwind, Typescript',
  Salary: '8LPA'
    },
    {
      id: 5,
      name: 'IT Department',
      position: 'Data Analyst',
      interviewDate: '2025-05-11',
      plateform: 'MonsterIndia.com',
      location: 'Noida',
      managerStatus: 'Approved',
 todoAction: 'HTML, CSS, Javascript, Angular , MYSQL, Bootstrap, Tailwind, Typescript',
  Salary: '9LPA'
    },
    {
      id: 6,
      name: 'IT Department',
      position: 'HR Executive',
      interviewDate: '2025-05-13',
      plateform: 'TimesJobs',
       location: 'Noida',
      managerStatus: 'Rejected',
 todoAction: 'HTML, CSS, Javascript, Angular , MYSQL, Bootstrap, Tailwind, Typescript',
  Salary: '7LPA'
    },
    {
      id: 7,
      name: 'Sales Department',
      position: 'Product Manager',
      interviewDate: '2025-05-14',
      plateform: 'Internshala',
       location: 'Gurgoan', 
      managerStatus: 'Approved',
 todoAction: 'HTML, CSS, Javascript, Angular , MYSQL, Bootstrap, Tailwind, Typescript',
 Salary: '5LPA'
    }
  ];
  
 

    get filteredCandidates() {
      const search = this.searchText.toLowerCase();
      let filtered = this.candidatePipelineList.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.position.toLowerCase().includes(search) ||
        c.interviewDate.toLowerCase().includes(search) ||
        c.managerStatus.toLowerCase().includes(search) ||
        c.todoAction.toLowerCase().includes(search) ||
        c.plateform.toLowerCase().includes(search) ||
        c.Salary.toLowerCase().includes(search) ||
        c.location.toLocaleLowerCase().includes(search)
      );

      return this.showAll ? filtered : filtered.slice(0, 3); // show only 3 by default
  
  }
  

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'badge bg-success';
      case 'Pending':
        return 'badge bg-warning';
      case 'Rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }



  toggleViewAll() {
    this.showAll = !this.showAll;
  }

  
}





