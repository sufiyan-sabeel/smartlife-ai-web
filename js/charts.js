const Charts = {
  barChart: null,
  pieChart: null,

  initBarChart(canvasId, labels, data, label = 'Expenses') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.barChart) {
      this.barChart.destroy();
    }

    const isDark = Theme.isDark();

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: isDark ? 'rgba(108, 99, 255, 0.7)' : 'rgba(108, 99, 255, 0.8)',
          borderColor: '#6C63FF',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: isDark ? '#999' : '#666' }
          },
          y: {
            grid: { color: isDark ? '#2a2a2a' : '#e0e0e0' },
            ticks: { color: isDark ? '#999' : '#666' }
          }
        }
      }
    });
  },

  initPieChart(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const isDark = Theme.isDark();
    const colors = ['#6C63FF', '#e74c3c', '#2ecc71', '#f39c12', '#3498db', '#9b59b6', '#1abc9c'];

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: isDark ? '#999' : '#666',
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 10
            }
          }
        }
      }
    });
  },

  updateColors() {
    const isDark = Theme.isDark();
    const textColor = isDark ? '#999' : '#666';
    const gridColor = isDark ? '#2a2a2a' : '#e0e0e0';

    if (this.barChart) {
      this.barChart.options.scales.x.ticks.color = textColor;
      this.barChart.options.scales.y.ticks.color = textColor;
      this.barChart.options.scales.y.grid.color = gridColor;
      this.barChart.update();
    }

    if (this.pieChart) {
      this.pieChart.options.plugins.legend.labels.color = textColor;
      this.pieChart.update();
    }
  }
};
