import { Component, inject, OnInit } from '@angular/core';
import { StatsService } from '../../core/services/stats-service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.html',
  styles: `
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: #ffffff;
      border-radius: 18px;
      padding: 22px;

      border: 1px solid #e2e8f0;

      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);

      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-5px);

        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);

        border-color: #cbd5e1;
      }

      .label {
        font-size: 13px;
        font-weight: 500;
        color: #64748b;
        margin-bottom: 10px;
      }

      .value {
        font-size: 32px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1;
        margin-bottom: 10px;
      }

      .change {
        font-size: 13px;
        font-weight: 500;
        color: #64748b;
      }

      .positive {
        color: #16a34a;
      }

      .danger {
        color: #dc2626;
      }
    }
  `,
})
export class StatsComponent implements OnInit {
  stats: any;
  constructor() {}

  statsService = inject(StatsService);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats() {
    this.statsService.getStats().subscribe({
      next: (res) => {
        this.stats = res.data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
