// Chart.js Configuration Module

const ChartConfig = (function() {
    // Default chart colors
    const colors = {
        primary: '#0d6efd',
        success: '#198754',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#0dcaf0',
        secondary: '#6c757d',
        dark: '#212529',
        light: '#f8f9fa'
    };

    // Chart themes
    const themes = {
        light: {
            grid: '#dee2e6',
            text: '#212529'
        },
        dark: {
            grid: '#373b3e',
            text: '#f8f9fa'
        }
    };

    // Get current theme
    function getCurrentTheme() {
        return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    }

    // Create revenue chart
    function createRevenueChart(canvasId, data) {
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return null;

        const theme = themes[getCurrentTheme()];

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Revenue',
                    data: data.values || [],
                    borderColor: colors.primary,
                    backgroundColor: `rgba(13, 110, 253, 0.1)`,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: theme.text
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: theme.grid
                        },
                        ticks: {
                            color: theme.text
                        }
                    },
                    y: {
                        grid: {
                            color: theme.grid
                        },
                        ticks: {
                            color: theme.text,
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    // Create payment distribution chart
    function createPaymentChart(canvasId, data) {
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return null;

        const theme = themes[getCurrentTheme()];

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels || ['Completed', 'Pending', 'Failed'],
                datasets: [{
                    data: data.values || [65, 25, 10],
                    backgroundColor: [colors.success, colors.warning, colors.danger],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: theme.text
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    // Create student enrollment chart
    function createEnrollmentChart(canvasId, data) {
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return null;

        const theme = themes[getCurrentTheme()];

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: 'Enrollments',
                    data: data.values || [],
                    backgroundColor: colors.info,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: theme.text
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: theme.grid
                        },
                        ticks: {
                            color: theme.text
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: theme.grid
                        },
                        ticks: {
                            color: theme.text,
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Create course popularity chart
    function createCoursePopularityChart(canvasId, data) {
        const ctx = document.getElementById(canvasId)?.getContext('2d');
        if (!ctx) return null;

        const theme = themes[getCurrentTheme()];

        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels || [],
                datasets: [{
                    data: data.values || [],
                    backgroundColor: [
                        colors.primary,
                        colors.success,
                        colors.info,
                        colors.warning,
                        colors.danger,
                        colors.secondary
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: theme.text
                        }
                    }
                }
            }
        });
    }

    // Update all charts theme
    function updateChartsTheme() {
        // This function would be called when toggling dark/light mode
        // It would need to update all existing chart instances
        const theme = themes[getCurrentTheme()];
        
        Chart.helpers.each(Chart.instances, (instance) => {
            if (instance.options.scales) {
                if (instance.options.scales.x) {
                    instance.options.scales.x.grid.color = theme.grid;
                    instance.options.scales.x.ticks.color = theme.text;
                }
                if (instance.options.scales.y) {
                    instance.options.scales.y.grid.color = theme.grid;
                    instance.options.scales.y.ticks.color = theme.text;
                }
            }
            
            if (instance.options.plugins?.legend?.labels) {
                instance.options.plugins.legend.labels.color = theme.text;
            }
            
            instance.update();
        });
    }

    // Public API
    return {
        createRevenueChart,
        createPaymentChart,
        createEnrollmentChart,
        createCoursePopularityChart,
        updateChartsTheme,
        colors
    };
})();