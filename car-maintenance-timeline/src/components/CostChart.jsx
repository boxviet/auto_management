import { useState, useMemo } from 'react';

export function CostChart({ timeline }) {
  const [timeRange, setTimeRange] = useState('1year'); // 1month, 3months, 6months, 1year, 2years

  const chartData = useMemo(() => {
    if (!timeline) return [];

    const data = [];
    const today = new Date();
    let months = 12;
    
    switch (timeRange) {
      case '1month': months = 1; break;
      case '3months': months = 3; break;
      case '6months': months = 6; break;
      case '1year': months = 12; break;
      case '2years': months = 24; break;
      default: months = 12;
    }

    // Calculate cumulative costs over time
    let cumulativeGas = 0;
    let cumulativeMaintenance = 0;

    for (let i = 0; i <= months; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() + i);
      
      // Monthly fuel/energy cost
      const monthlyFuel = timeline.monthlyFuelCost || 0;
      cumulativeGas += monthlyFuel;

      // Check for maintenance events this month
      let monthlyMaintenance = 0;
      
      // Oil changes
      if (timeline.oilChanges) {
        timeline.oilChanges.forEach(change => {
          const changeDate = new Date(change.date);
          if (changeDate.getMonth() === date.getMonth() && 
              changeDate.getFullYear() === date.getFullYear()) {
            monthlyMaintenance += 60; // Average oil change cost
          }
        });
      }

      // Tire rotations
      if (timeline.tireRotations) {
        timeline.tireRotations.forEach(rotation => {
          const rotationDate = new Date(rotation.date);
          if (rotationDate.getMonth() === date.getMonth() && 
              rotationDate.getFullYear() === date.getFullYear()) {
            monthlyMaintenance += 40; // Average tire rotation cost
          }
        });
      }

      cumulativeMaintenance += monthlyMaintenance;

      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        gas: cumulativeGas,
        maintenance: cumulativeMaintenance,
        total: cumulativeGas + cumulativeMaintenance
      });
    }

    return data;
  }, [timeline, timeRange]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map(d => d.total));
  }, [chartData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (chartData.length === 0) return null;

  const chartHeight = 200;
  const chartWidth = chartData.length > 1 ? 100 / (chartData.length - 1) : 100;

  return (
    <div className="cost-chart-container">
      <div className="chart-header">
        <h3>Estimated Costs Over Time</h3>
        <div className="time-range-selector">
          {[
            { key: '1month', label: '1M' },
            { key: '3months', label: '3M' },
            { key: '6months', label: '6M' },
            { key: '1year', label: '1Y' },
            { key: '2years', label: '2Y' }
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`time-range-btn ${timeRange === key ? 'active' : ''}`}
              onClick={() => setTimeRange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color gas"></span>
          <span>{timeline.fuelType === 'electric' ? 'Energy' : 'Fuel'}</span>
        </div>
        <div className="legend-item">
          <span className="legend-color maintenance"></span>
          <span>Maintenance</span>
        </div>
        <div className="legend-item total">
          <span>Total: {formatCurrency(chartData[chartData.length - 1]?.total || 0)}</span>
        </div>
      </div>

      <div className="chart-wrapper">
        {/* Y-axis labels */}
        <div className="y-axis">
          {[...Array(5)].map((_, i) => {
            const value = maxValue * (1 - i / 4);
            return (
              <div key={i} className="y-axis-label">
                {formatCurrency(value)}
              </div>
            );
          })}
        </div>

        {/* Chart area */}
        <div className="chart-area">
          {/* Grid lines */}
          <div className="grid-lines">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid-line" />
            ))}
          </div>

          {/* SVG Chart */}
          <svg viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none" className="chart-svg">
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#667eea" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="maintenanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Gas area */}
            <path
              d={`
                M 0,${chartHeight}
                ${chartData.map((d, i) => {
                  const x = i * chartWidth;
                  const y = chartHeight - (d.gas / maxValue) * chartHeight;
                  return `L ${x},${y}`;
                }).join(' ')}
                L 100,${chartHeight}
                Z
              `}
              fill="url(#gasGradient)"
            />

            {/* Maintenance area */}
            <path
              d={`
                M 0,${chartHeight}
                ${chartData.map((d, i) => {
                  const x = i * chartWidth;
                  const y = chartHeight - (d.total / maxValue) * chartHeight;
                  return `L ${x},${y}`;
                }).join(' ')}
                L 100,${chartHeight}
                Z
              `}
              fill="url(#maintenanceGradient)"
            />

            {/* Total line */}
            <path
              d={chartData.map((d, i) => {
                const x = i * chartWidth;
                const y = chartHeight - (d.total / maxValue) * chartHeight;
                return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#333"
              strokeWidth="0.5"
            />

            {/* Gas line */}
            <path
              d={chartData.map((d, i) => {
                const x = i * chartWidth;
                const y = chartHeight - (d.gas / maxValue) * chartHeight;
                return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#667eea"
              strokeWidth="0.8"
            />

            {/* Data points */}
            {chartData.map((d, i) => {
              const x = i * chartWidth;
              const y = chartHeight - (d.total / maxValue) * chartHeight;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="1"
                  fill="#333"
                />
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div className="x-axis">
            {chartData.filter((_, i) => i % Math.ceil(chartData.length / 6) === 0 || i === chartData.length - 1).map((d, i) => (
              <div key={i} className="x-axis-label">
                {d.month}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
