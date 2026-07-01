import { useEffect, useMemo, useState } from "react";
import { getCities, getNeighborhoods } from "../services/region.service";

function RegionFormModal({ isOpen, onClose, onSave, region }) {
  const [form, setForm] = useState({
    name: "",
    city: "",
    neighborhood: "",
    latitude: "",
    longitude: "",
    radius: "",
  });
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [citySearch, setCitySearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!region) {
      setForm({
        name: "",
        city: "",
        neighborhood: "",
        latitude: "",
        longitude: "",
        radius: "",
      });
      setError("");
      setCitySearch("");
      setCities([]);
      setNeighborhoods([]);
      return;
    }

    setForm({
      name: region.name || "",
      city: region.city || "",
      neighborhood: region.neighborhood || "",
      latitude: region.latitude || "",
      longitude: region.longitude || "",
      radius: region.radius || "",
    });
    setError("");
    setCitySearch(region.city || "");
  }, [region]);

  useEffect(() => {
    const loadCities = async () => {
      if (!citySearch.trim()) {
        setCities([]);
        return;
      }

      try {
        const data = await getCities(citySearch.trim());
        setCities(data);
      } catch {
        setCities([]);
      }
    };

    loadCities();
  }, [citySearch]);

  useEffect(() => {
    const loadNeighborhoods = async () => {
      if (!form.city.trim()) {
        setNeighborhoods([]);
        return;
      }

      try {
        const data = await getNeighborhoods("", form.city.trim());
        setNeighborhoods(data);
      } catch {
        setNeighborhoods([]);
      }
    };

    loadNeighborhoods();
  }, [form.city]);

  const selectedCity = useMemo(
    () => cities.find((item) => item.name === form.city) || null,
    [cities, form.city]
  );

  const hasSelectedCoordinates =
    form.latitude !== "" && form.longitude !== "";

  if (!isOpen) {
    return null;
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCitySelect = (cityName) => {
    setForm((prev) => ({ ...prev, city: cityName, neighborhood: "" }));
    setCitySearch(cityName);
  };

  const handleMapClick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const xPercent = (event.clientX - bounds.left) / bounds.width;
    const yPercent = (event.clientY - bounds.top) / bounds.height;

    const latitude = (1 - yPercent) * 180 - 90;
    const longitude = xPercent * 360 - 180;

    setForm((prev) => ({
      ...prev,
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Region name is required.");
      return;
    }

    const latitude = parseFloat(form.latitude);
    const longitude = parseFloat(form.longitude);
    const radius = parseFloat(form.radius);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setError("Center coordinates are required. Select a point on the map.");
      return;
    }

    if (Number.isNaN(radius) || radius <= 0) {
      setError("Radius must be greater than 0.");
      return;
    }

    try {
      await onSave({
        name: form.name.trim(),
        city: form.city.trim(),
        neighborhood: form.neighborhood.trim(),
        latitude,
        longitude,
        radius,
      });
      onClose();
    } catch (saveError) {
      setError(saveError?.message || "Failed to save region. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="region-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{region ? "Edit region" : "Create region"}</h2>
          <button className="modal-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="region-form" onSubmit={handleSubmit}>
          <label>
            Region name
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Region name"
            />
          </label>

          <label>
            City
            <input
              type="text"
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                handleChange("city", e.target.value);
              }}
              placeholder="Search city"
            />
          </label>

          {cities.length > 0 && (
            <div className="region-suggestions">
              {cities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  className="suggestion-button"
                  onClick={() => handleCitySelect(city.name)}
                >
                  {city.name}
                </button>
              ))}
            </div>
          )}

          <label>
            Neighborhood
            <select
              value={form.neighborhood}
              onChange={(e) => handleChange("neighborhood", e.target.value)}
            >
              <option value="">Select neighborhood</option>
              {neighborhoods.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Region center
            <div className="region-map" onClick={handleMapClick}>
              <span className="map-label">Click to select center</span>
              {hasSelectedCoordinates && (
                <div className="map-point" />
              )}
            </div>
          </label>

          <label>
            Latitude
            <input type="text" value={form.latitude} readOnly placeholder="Click map to select" />
          </label>

          <label>
            Longitude
            <input type="text" value={form.longitude} readOnly placeholder="Click map to select" />
          </label>

          <label>
            Radius KM
            <input
              type="number"
              step="any"
              value={form.radius}
              onChange={(e) => handleChange("radius", e.target.value)}
              placeholder="Radius in kilometers"
            />
          </label>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button className="modal-button" type="submit">
              Save region
            </button>
            <button
              className="modal-button secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegionFormModal;
