import dynamic from "next/dynamic";
import pscaaAirQualityData from "../assets/seattle_pscaa_air_quality_data.json";

// Dynamically import HeatmapLayer to avoid SSR issues
const HeatmapLayer = dynamic(
  () => import("react-leaflet-heatmap-layer-v3").then((mod) => mod.HeatmapLayer),
  { ssr: false }
);

// Dynamically import react-leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Air Quality overlay as a heatmap using PSCAA data
export const AirQualityOverlay = () => {
  // Convert PSCAA sensor data → heatmap data format [lat, lng, intensity]
  const heatmapPoints = pscaaAirQualityData.sensors.map((sensor) => {
    const { lat, lon, air_quality } = sensor;
    const aqi = air_quality.overall_aqi;
    return [lat, lon, aqi]; // intensity = AQI
  });

  // Get AQI color based on value
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#00e400'; // Good - Green
    if (aqi <= 100) return '#ffff00'; // Moderate - Yellow
    if (aqi <= 150) return '#ff7e00'; // Unhealthy for Sensitive - Orange
    if (aqi <= 200) return '#ff0000'; // Unhealthy - Red
    if (aqi <= 300) return '#8f3f97'; // Very Unhealthy - Purple
    return '#7e0023'; // Hazardous - Maroon
  };

  return (
    <>
      {/* Heatmap Layer */}
      <HeatmapLayer
        fitBoundsOnLoad
        fitBoundsOnUpdate
        points={heatmapPoints}
        longitudeExtractor={(p) => p[1]}
        latitudeExtractor={(p) => p[0]}
        intensityExtractor={(p) => p[2]}
        radius={80}
        blur={35}
        max={100}
        minOpacity={0.4}
      />
      
      {/* Hover Markers with Popups */}
      {pscaaAirQualityData.sensors.map((sensor, index) => {
        const { lat, lon, station_name, air_quality, last_updated } = sensor;
        const aqi = air_quality.overall_aqi;
        const category = air_quality.category;
        const riskLevel = air_quality.risk_level;
        
        return (
          <CircleMarker
            key={`air-quality-${index}`}
            center={[lat, lon]}
            radius={8}
            pathOptions={{
              color: getAQIColor(aqi),
              fillColor: getAQIColor(aqi),
              fillOpacity: 0.8,
              weight: 2
            }}
          >
            <Popup>
              <div style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontSize: '14px', 
                color: '#333',
                minWidth: '200px'
              }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  color: '#2c3e50',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {station_name}
                </h3>
                
                <div style={{ marginBottom: '8px' }}>
                  <strong>Air Quality Index: </strong>
                  <span style={{ 
                    color: getAQIColor(aqi),
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {aqi}
                  </span>
                  <span style={{ 
                    color: getAQIColor(aqi),
                    fontWeight: 'bold',
                    marginLeft: '8px'
                  }}>
                    ({category})
                  </span>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <strong>Risk Level: </strong>
                  <span style={{ color: getAQIColor(aqi) }}>
                    {riskLevel}
                  </span>
                </div>
                
                {air_quality.pollutants && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Key Pollutants:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                      {air_quality.pollutants.pm25 && (
                        <li>PM2.5: {air_quality.pollutants.pm25.concentration} μg/m³</li>
                      )}
                      {air_quality.pollutants.ozone && (
                        <li>Ozone: {air_quality.pollutants.ozone.concentration} ppm</li>
                      )}
                      {air_quality.pollutants.no2 && (
                        <li>NO₂: {air_quality.pollutants.no2.concentration} ppb</li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  marginTop: '8px',
                  borderTop: '1px solid #eee',
                  paddingTop: '4px'
                }}>
                  Last Updated: {new Date(last_updated).toLocaleString()}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};
