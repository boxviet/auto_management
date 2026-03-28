import { useState } from 'react';

export function VehicleForm({ onSubmit, onCancel }) {
  const [useVin, setUseVin] = useState(true);
  const [activeSection, setActiveSection] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    vin: '',
    model: '',
    fuel_type: 'gas', // gas, diesel, electric
    current_mileage: '',
    daily_commute: '',
    zip_code: '',
    mpg: '25',
    kwh_per_mile: '0.3', // For EVs
    // Engine maintenance
    last_oil_change: '',
    oil_change_interval: '5000',
    // Tires
    tire_rotation_interval: '7500',
    last_tire_rotation: '',
    tire_pressure_check: 'monthly'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Generate fuel price based on type
    const zipSum = formData.zip_code.split('').reduce((a, b) => a + parseInt(b), 0);
    let fuelPrice;
    let fuelUnit;
    
    switch (formData.fuel_type) {
      case 'diesel':
        fuelPrice = Math.round((3.20 + (zipSum % 20) * 0.10) * 100) / 100;
        fuelUnit = 'gal';
        break;
      case 'electric':
        fuelPrice = Math.round((0.12 + (zipSum % 8) * 0.01) * 100) / 100;
        fuelUnit = 'kWh';
        break;
      case 'gas':
      default:
        fuelPrice = Math.round((2.80 + (zipSum % 17) * 0.10) * 100) / 100;
        fuelUnit = 'gal';
        break;
    }

    const vehicleData = {
      name: formData.name,
      vin: useVin ? formData.vin : null,
      model: !useVin ? formData.model : null,
      fuel_type: formData.fuel_type,
      current_mileage: parseInt(formData.current_mileage),
      daily_commute: parseInt(formData.daily_commute),
      zip_code: formData.zip_code,
      mpg: formData.fuel_type === 'electric' ? null : (parseFloat(formData.mpg) || 25),
      kwh_per_mile: formData.fuel_type === 'electric' ? (parseFloat(formData.kwh_per_mile) || 0.3) : null,
      fuel_price: fuelPrice,
      fuel_unit: fuelUnit,
      // Engine data (EVs don't need oil changes)
      last_oil_change: formData.fuel_type === 'electric' ? null : (formData.last_oil_change || null),
      oil_change_interval: formData.fuel_type === 'electric' ? null : (parseInt(formData.oil_change_interval) || 5000),
      // Tire data
      tire_rotation_interval: formData.last_tire_rotation ? parseInt(formData.tire_rotation_interval) || 7500 : null,
      last_tire_rotation: formData.last_tire_rotation || null,
      tire_pressure_check: formData.tire_pressure_check
    };

    await onSubmit(vehicleData);
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const renderBasicSection = () => (
    <>
      <div className="input-group">
        <label>Vehicle Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., My Honda Civic"
          required
        />
      </div>

      <div className="input-toggle">
        <button
          type="button"
          className={useVin ? 'active' : ''}
          onClick={() => setUseVin(true)}
        >
          Use VIN
        </button>
        <button
          type="button"
          className={!useVin ? 'active' : ''}
          onClick={() => setUseVin(false)}
        >
          Use Model
        </button>
      </div>

      {useVin ? (
        <div className="input-group">
          <label>VIN Number</label>
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            placeholder="e.g., 1HGCM82633A123456"
            maxLength={17}
          />
        </div>
      ) : (
        <div className="input-group">
          <label>Car Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g., 2020 Toyota Camry"
          />
        </div>
      )}

      <div className="input-group">
        <label>Fuel Type *</label>
        <select
          name="fuel_type"
          value={formData.fuel_type}
          onChange={handleChange}
          required
        >
          <option value="gas">⛽ Gasoline</option>
          <option value="diesel">🛢️ Diesel</option>
          <option value="electric">🔋 Electric (EV)</option>
        </select>
      </div>

      <div className="input-group">
        <label>Current Mileage *</label>
        <input
          type="number"
          name="current_mileage"
          value={formData.current_mileage}
          onChange={handleChange}
          placeholder="e.g., 45000"
          min="0"
          required
        />
      </div>

      <div className="input-group">
        <label>Daily Commute (one way) *</label>
        <input
          type="number"
          name="daily_commute"
          value={formData.daily_commute}
          onChange={handleChange}
          placeholder="e.g., 15"
          min="1"
          required
        />
        <small>miles (round trip calculated automatically)</small>
      </div>

      <div className="input-group">
        <label>ZIP Code *</label>
        <input
          type="text"
          name="zip_code"
          value={formData.zip_code}
          onChange={handleChange}
          placeholder="e.g., 90210"
          maxLength={10}
          required
        />
      </div>

      {formData.fuel_type === 'electric' ? (
        <div className="input-group">
          <label>kWh per Mile (optional)</label>
          <input
            type="number"
            name="kwh_per_mile"
            value={formData.kwh_per_mile}
            onChange={handleChange}
            placeholder="e.g., 0.3"
            min="0.1"
            step="0.1"
          />
          <small>Average is 0.25-0.35 kWh/mile for most EVs</small>
        </div>
      ) : (
        <div className="input-group">
          <label>{formData.fuel_type === 'diesel' ? 'MPG (Diesel)' : 'MPG'} (optional)</label>
          <input
            type="number"
            name="mpg"
            value={formData.mpg}
            onChange={handleChange}
            placeholder={formData.fuel_type === 'diesel' ? "e.g., 35" : "e.g., 28"}
            min="1"
            step="0.1"
          />
        </div>
      )}
    </>
  );

  const renderEngineSection = () => {
    if (formData.fuel_type === 'electric') {
      return (
        <>
          <div className="ev-notice">
            <div className="ev-icon">🔋</div>
            <div className="ev-text">
              <strong>Electric Vehicle</strong>
              <p>EVs don't require oil changes! We'll track tire maintenance and energy costs for you.</p>
            </div>
          </div>

          <div className="input-group">
            <label>Last Battery Service/Check</label>
            <input
              type="date"
              name="last_oil_change"
              value={formData.last_oil_change}
              onChange={handleChange}
            />
            <small>Optional - for battery health tracking</small>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="input-group">
          <label>Last Oil Change Date</label>
          <input
            type="date"
            name="last_oil_change"
            value={formData.last_oil_change}
            onChange={handleChange}
          />
          <small>Leave empty if unknown - we'll use current mileage</small>
        </div>

        <div className="input-group">
          <label>Oil Change Interval</label>
          <select
            name="oil_change_interval"
            value={formData.oil_change_interval}
            onChange={handleChange}
          >
            {formData.fuel_type === 'diesel' ? (
              <>
                <option value="5000">5,000 miles (Diesel Standard)</option>
                <option value="7500">7,500 miles (Diesel Synthetic)</option>
                <option value="10000">10,000 miles (Diesel Full Synthetic)</option>
                <option value="15000">15,000 miles (Heavy Duty Diesel)</option>
              </>
            ) : (
              <>
                <option value="3000">3,000 miles (Standard)</option>
                <option value="5000">5,000 miles (Recommended)</option>
                <option value="7500">7,500 miles (Synthetic)</option>
                <option value="10000">10,000 miles (Full Synthetic)</option>
              </>
            )}
          </select>
        </div>
      </>
    );
  };

  const renderTiresSection = () => (
    <>
      <div className="input-group">
        <label>Last Tire Rotation Date</label>
        <input
          type="date"
          name="last_tire_rotation"
          value={formData.last_tire_rotation}
          onChange={handleChange}
        />
        <small>Leave empty to skip tire rotation tracking</small>
      </div>

      {formData.last_tire_rotation && (
        <div className="input-group">
          <label>Tire Rotation Interval</label>
          <select
            name="tire_rotation_interval"
            value={formData.tire_rotation_interval}
            onChange={handleChange}
          >
            <option value="5000">5,000 miles</option>
            <option value="7500">7,500 miles (Standard)</option>
            <option value="10000">10,000 miles</option>
          </select>
        </div>
      )}

      <div className="input-group">
        <label>Tire Pressure Check Frequency</label>
        <select
          name="tire_pressure_check"
          value={formData.tire_pressure_check}
          onChange={handleChange}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="form-container">
      <h2>Add New Vehicle</h2>
      
      <div className="form-section-tabs">
        <button
          type="button"
          className={activeSection === 'basic' ? 'active' : ''}
          onClick={() => setActiveSection('basic')}
        >
          Basic Info
        </button>
        <button
          type="button"
          className={activeSection === 'engine' ? 'active' : ''}
          onClick={() => setActiveSection('engine')}
        >
          Engine
        </button>
        <button
          type="button"
          className={activeSection === 'tires' ? 'active' : ''}
          onClick={() => setActiveSection('tires')}
        >
          Tires
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeSection === 'basic' && renderBasicSection()}
        {activeSection === 'engine' && renderEngineSection()}
        {activeSection === 'tires' && renderTiresSection()}

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
}
