import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  BarChart3, 
  DollarSign, 
  Ticket, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  Loader2,
  AlertCircle,
  Target,
  Users,
  Clock,
  MapPin,
  Plane,
  Bus,
  Train,
  Ship
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import { api } from '../../config/api'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const RevenueOverview = () => {
  const [dateRange, setDateRange] = useState('30') // 7, 30, 90 days
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Calculate date range
  const getDateRange = () => {
    const end = new Date()
    const start = new Date()
    
    if (dateRange === 'custom') {
      return { start: new Date(startDate), end: new Date(endDate) }
    } else {
      const days = parseInt(dateRange)
      start.setDate(end.getDate() - days)
      return { start, end }
    }
  }

  const { start, end } = getDateRange()

  // Fetch revenue data
  const { data: revenueData, isLoading, error } = useQuery(
    ['vendorRevenue', { startDate: start.toISOString(), endDate: end.toISOString() }],
    async () => {
      const params = new URLSearchParams()
      params.append('startDate', start.toISOString())
      params.append('endDate', end.toISOString())
      
      const response = await api.get(`/vendor/revenue?${params}`)
      return response.data
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  const data = revenueData?.data || { metrics: {}, charts: {} }
  const metrics = data.metrics || {}
  const charts = data.charts || {}

  // Chart configuration options with improved contrast
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: 'var(--color-text-primary)',
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'var(--color-surface)',
        titleColor: 'var(--color-text-primary)',
        bodyColor: 'var(--color-text-secondary)',
        borderColor: 'var(--color-border)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: '600'
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'var(--color-border)',
          lineWidth: 1
        },
        ticks: {
          color: 'var(--color-text-primary)',
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
      x: {
        grid: {
          color: 'var(--color-border)',
          lineWidth: 1
        },
        ticks: {
          color: 'var(--color-text-primary)',
          font: {
            size: 11,
            weight: '500'
          }
        }
      }
    }
  }

  // Revenue trend chart data
  const revenueTrendData = {
    labels: charts.revenueByMonth?.map(item =>
      `${item._id.month}/${item._id.year}`
    ) || [],
    datasets: [
      {
        label: 'Revenue (BDT)',
        data: charts.revenueByMonth?.map(item => item.revenue) || [],
        borderColor: 'var(--color-primary)',
        backgroundColor: 'var(--color-primary)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'var(--color-primary)',
        pointBorderColor: 'var(--color-text-inverse)',
        pointBorderWidth: 2,
        pointRadius: 6
      },
      {
        label: 'Bookings',
        data: charts.revenueByMonth?.map(item => item.bookings) || [],
        borderColor: 'var(--color-success)',
        backgroundColor: 'var(--color-success)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'var(--color-success)',
        pointBorderColor: 'var(--color-text-inverse)',
        pointBorderWidth: 2,
        pointRadius: 6,
        yAxisID: 'y1'
      }
    ]
  }

  // Popular destinations chart data
  const popularDestinationsData = {
    labels: charts.popularDestinations?.slice(0, 8).map(item =>
      `${item._id.from} → ${item._id.to}`
    ) || [],
    datasets: [
      {
        label: 'Bookings',
        data: charts.popularDestinations?.slice(0, 8).map(item => item.bookings) || [],
        backgroundColor: [
          'var(--color-primary)',
          'var(--color-success)',
          'var(--color-warning)',
          'var(--color-danger)',
          'var(--color-secondary)',
          'var(--color-info)',
          'var(--color-primary)',
          'var(--color-success)'
        ],
        borderColor: [
          'var(--color-primary)',
          'var(--color-success)',
          'var(--color-warning)',
          'var(--color-danger)',
          'var(--color-secondary)',
          'var(--color-info)',
          'var(--color-primary)',
          'var(--color-success)'
        ],
        borderWidth: 2
      }
    ]
  }

  // Transport type distribution data
  const transportTypeData = {
    labels: charts.transportTypes?.map(item => {
      const typeIcons = { bus: '🚌', train: '🚆', plane: '✈️', launch: '🚢' }
      return `${typeIcons[item._id] || '🚌'} ${item._id.charAt(0).toUpperCase() + item._id.slice(1)}`
    }) || [],
    datasets: [
      {
        data: charts.transportTypes?.map(item => item.count) || [],
        backgroundColor: [
          'var(--color-primary)',
          'var(--color-success)',
          'var(--color-warning)',
          'var(--color-danger)'
        ],
        borderColor: [
          'var(--color-primary)',
          'var(--color-success)',
          'var(--color-warning)',
          'var(--color-danger)'
        ],
        borderWidth: 2
      }
    ]
  }

  // Booking status breakdown data
  const statusBreakdownData = {
    labels: charts.statusBreakdown?.map(item => {
      const statusIcons = {
        pending: '⏳',
        accepted: '✅',
        rejected: '❌',
        completed: '🎯',
        cancelled: '🚫'
      }
      return `${statusIcons[item._id] || '📋'} ${item._id.charAt(0).toUpperCase() + item._id.slice(1)}`
    }) || [],
    datasets: [
      {
        data: charts.statusBreakdown?.map(item => item.count) || [],
        backgroundColor: [
          'var(--color-warning)',
          'var(--color-success)',
          'var(--color-danger)',
          'var(--color-primary)',
          'var(--color-secondary)'
        ],
        borderColor: [
          'var(--color-warning)',
          'var(--color-success)',
          'var(--color-danger)',
          'var(--color-primary)',
          'var(--color-secondary)'
        ],
        borderWidth: 2
      }
    ]
  }

  // Get transport type icon
  const getTransportIcon = (type) => {
    const icons = { bus: Bus, train: Train, plane: Plane, launch: Ship }
    const Icon = icons[type] || Bus
    return <Icon className="h-5 w-5" />
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Export data (placeholder)
  const handleExport = () => {
    const exportData = {
      metrics,
      charts,
      dateRange: { start: start.toISOString(), end: end.toISOString() }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-report-${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-background min-h-screen p-6">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2 text-text-secondary">Loading revenue data...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12 bg-background-secondary rounded-lg shadow-md mx-6">
        <AlertCircle className="mx-auto h-12 w-12 text-danger" />
        <h3 className="mt-2 text-sm font-medium text-text-primary">Error loading revenue data</h3>
        <p className="mt-1 text-sm text-text-secondary">
          {error.response?.data?.message || 'Something went wrong. Please try again.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background-tertiary min-h-screen p-6">
      {/* Header */}
      <div className="bg-surface rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center">
              <BarChart3 className="mr-3 h-6 w-6 text-primary" />
              Revenue Overview
            </h1>
            <p className="text-text-secondary mt-1">
              Track your business performance and analytics
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <button
              onClick={handleExport}
              className="bg-success hover:bg-success-hover text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
            >
              <Download className="mr-2 h-5 w-5" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-surface rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">Date Range:</span>
          </div>
          <div className="flex space-x-2">
            {[
              { value: '7', label: '7 Days' },
              { value: '30', label: '30 Days' },
              { value: '90', label: '90 Days' },
              { value: 'custom', label: 'Custom' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors border ${
                  dateRange === option.value
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-background-tertiary text-text-primary border-border hover:bg-background-secondary hover:border-border-hover'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {dateRange === 'custom' && (
            <div className="flex space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-border rounded text-sm bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-border rounded text-sm bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface rounded-lg shadow-md py-6 border border-border">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-success flex items-center justify-center shadow-sm">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-text-secondary">Total Revenue</p>
              <p className="text-2xl font-semibold text-text-primary">
                {formatCurrency(metrics.totalRevenue || 0)}
              </p>
              <p className="text-xs text-success mt-1 font-medium">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                From accepted bookings
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Tickets Sold</p>
              <p className="text-2xl font-semibold text-text-primary">
                {(metrics.totalTicketsSold || 0).toLocaleString()}
              </p>
              <p className="text-xs text-primary mt-1 font-medium">
                <Target className="inline h-3 w-3 mr-1" />
                Accepted & paid
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-info flex items-center justify-center shadow-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-text-secondary">Tickets Added</p>
              <p className="text-2xl font-semibold text-text-primary">
                {(metrics.totalTicketsAdded || 0).toLocaleString()}
              </p>
              <p className="text-xs text-info mt-1 font-medium">
                <Calendar className="inline h-3 w-3 mr-1" />
                Total in catalog
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow-md py-6 border border-border">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-warning flex items-center justify-center shadow-sm">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Avg. Booking Value</p>
              <p className="text-2xl font-semibold text-text-primary">
                {formatCurrency(metrics.averageBookingValue || 0)}
              </p>
              <p className="text-xs text-warning mt-1 font-medium">
                <Clock className="inline h-3 w-3 mr-1" />
                Per transaction
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Conversion Rate</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-success">
                {(metrics.conversionRate || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-text-secondary">Bookings accepted</p>
            </div>
            <div className="p-3 rounded-full bg-success shadow-sm">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Popular Route</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {charts.popularDestinations?.[0] ?
                  `${charts.popularDestinations[0]._id.from} → ${charts.popularDestinations[0]._id.to}` :
                  'N/A'
                }
              </p>
              <p className="text-sm text-text-secondary">
                {charts.popularDestinations?.[0]?.bookings || 0} bookings
              </p>
            </div>
            <div className="p-3 rounded-full bg-primary shadow-sm">
              <MapPin className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top Transport</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {charts.transportTypes?.[0]?._id ?
                  charts.transportTypes[0]._id.charAt(0).toUpperCase() + charts.transportTypes[0]._id.slice(1) :
                  'N/A'
                }
              </p>
              <p className="text-sm text-text-secondary">
                {charts.transportTypes?.[0]?.count || 0} bookings
              </p>
            </div>
            <div className="p-3 rounded-full bg-info shadow-sm">
              {charts.transportTypes?.[0]?._id ?
                getTransportIcon(charts.transportTypes[0]._id) :
                <Bus className="h-8 w-8 text-white" />
              }
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Revenue Trend</h3>
          <div className="h-80">
            <Line
              data={revenueTrendData}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      color: 'var(--color-text-primary)',
                      font: {
                        size: 11,
                        weight: '500'
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Popular Destinations</h3>
          <div className="h-80">
            <Bar data={popularDestinationsData} options={chartOptions} />
          </div>
        </div>

        {/* Transport Type Distribution */}
        <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Transport Type Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={transportTypeData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      ...chartOptions.plugins.legend.labels,
                      color: 'var(--color-text-primary)',
                      font: {
                        size: 11,
                        weight: '500'
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Booking Status Breakdown */}
        <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Booking Status Breakdown</h3>
          <div className="h-80 flex items-center justify-center">
            <Pie
              data={statusBreakdownData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      ...chartOptions.plugins.legend.labels,
                      color: 'var(--color-text-primary)',
                      font: {
                        size: 11,
                        weight: '500'
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueOverview
