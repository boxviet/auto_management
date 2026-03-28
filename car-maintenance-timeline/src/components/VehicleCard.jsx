const fuelTypeIcons = {
  gas: '⛽',
  diesel: '🛢️',
  electric: '🔋'
};

const fuelTypeLabels = {
  gas: 'Gasoline',
  diesel: 'Diesel',
  electric: 'Electric'
};

export function VehicleCard({ vehicle, onClick, onDelete }) {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this vehicle?')) {
      onDelete();
    }
  };

  const fuelType = vehicle.fuel_type || 'gas';

  return (
    <div className="vehicle-card" onClick={onClick}>
      <div className="vehicle-card-header">
        <h3>{vehicle.name}</h3>
        <span className="fuel-badge" title={fuelTypeLabels[fuelType]}>
          {fuelTypeIcons[fuelType]}
        </span>
        <button className="delete-btn" onClick={handleDelete}>×</button>
      </div>
      <div className="vehicle-card-details">
        <div className="detail-row">
          <span className="detail-label">Mileage:</span>
          <span className="detail-value">{vehicle.current_mileage.toLocaleString()} mi</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Daily Drive:</span>
          <span className="detail-value">{vehicle.daily_commute * 2} mi</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Type:</span>
          <span className="detail-value">{fuelTypeLabels[fuelType]}</span>
        </div>
        {vehicle.model && (
          <div className="detail-row">
            <span className="detail-label">Model:</span>
            <span className="detail-value">{vehicle.model}</span>
          </div>
        )}
        {vehicle.vin && (
          <div className="detail-row">
            <span className="detail-label">VIN:</span>
            <span className="detail-value">{vehicle.vin.slice(0, 8)}...</span>
          </div>
        )}
      </div>
      <div className="vehicle-card-footer">
        <span className="view-timeline">View Timeline →</span>
      </div>
    </div>
  );
}
