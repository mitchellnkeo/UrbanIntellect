'use client';
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-leaflet components (SSR safe)
const CircleMarker = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then((m) => m.useMap), { ssr: false });

// ---- Helper hook to add heatmap layer ----
const PSCAAHeatLayer = ({ sensors }) => {
  const map = useMap();

  // Memoize points to avoid re-creating array on every render
  const points = useMemo(
    () =>
      sensors
        .filter(s => s.lat && s.lon && s.air_quality?.overall_aqi)
        .map(({ lat, lon, air_quality }) => [
          lat,
          lon,
          air_quality.overall_aqi / 100, // Normalize to 0-5 range for better heatmap intensity
        ]),
    [sensors]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !map || !points.length) return;

    let heat;

    (async () => {
      // Import Leaflet and plugin only on client
      const L = (await import('leaflet')).default;
      await import('leaflet.heat');

      heat = L.heatLayer(points, {
        radius: 25,
        gradient: {
          0.2: '#00e400',
          0.4: '#ffff00',
          0.6: '#ff7e00',
          0.8: '#ff0000',
          1.0: '#8f3f97',
        },
      }).addTo(map);
    })();

    return () => {
      if (heat) map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
};

// ---- AQI + Traffic color helpers ----
const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#00e400';
  if (aqi <= 100) return '#ffff00';
  if (aqi <= 150) return '#ff7e00';
  if (aqi <= 200) return '#ff0000';
  if (aqi <= 300) return '#8f3f97';
  return '#7e0023';
};

const getTrafficColor = (impact) =>
  impact.includes('High')
    ? '#ff4444'
    : impact.includes('Moderate')
    ? '#ffaa00'
    : '#44ff44';

const getTrafficLevel = (impact) =>
  impact.includes('High') ? 'HIGH' : impact.includes('Moderate') ? 'MODERATE' : 'LOW';

// ---- Main Overlay Component ----
export const AirQualityOverlay = () => {
  const [pscaaAirQualityData, setPscaaAirQualityData] = useState(null);

  // Load the JSON data on mount
  useEffect(() => {
    fetch('/seattle_pscaa_air_quality_data.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch air quality data');
        return res.json();
      })
      .then(data => setPscaaAirQualityData(data))
      .catch(error => console.error('Error loading air quality data:', error));
  }, []);

  // Memoize sensors to stabilize reference
  const sensors = useMemo(() => pscaaAirQualityData?.sensors || [], [pscaaAirQualityData]);

  if (!pscaaAirQualityData) {
    return null; // or a loading spinner
  }

  return (
    <>
      <PSCAAHeatLayer sensors={sensors} />

      {sensors.map((sensor, i) => {
        const { lat, lon, station_name, air_quality, traffic_impact, last_updated } = sensor;
        const aqi = air_quality.overall_aqi;
        const color = getAQIColor(aqi);

        return (
          <CircleMarker
            key={`aq-${i}`}
            center={[lat, lon]}
            radius={10}
            pathOptions={{
              color: getTrafficColor(traffic_impact),
              fillColor: color,
              fillOpacity: 0.8,
              weight: 3,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, minWidth: 200 }}>
                <h3 style={{ margin: '0 0 8px', color: '#2c3e50', fontSize: 16 }}>{station_name}</h3>

                <div style={{ marginBottom: 8 }}>
                  <strong>AQI: </strong>
                  <span style={{ color, fontWeight: 'bold' }}>{aqi}</span> ({air_quality.category})
                </div>

                <div style={{ marginBottom: 8 }}>
                  <strong>Risk Level: </strong>
                  <span style={{ color }}>{air_quality.risk_level}</span>
                </div>

                <div
                  style={{
                    marginBottom: 8,
                    padding: '6px 8px',
                    background: '#f8f9fa',
                    borderRadius: 4,
                    border: `2px solid ${getTrafficColor(traffic_impact)}`,
                  }}
                >
                  <strong>Traffic: </strong>
                  <span
                    style={{
                      color: getTrafficColor(traffic_impact),
                      fontWeight: 'bold',
                    }}
                  >
                    {getTrafficLevel(traffic_impact)} - {traffic_impact}
                  </span>
                </div>

                {air_quality.pollutants && (
                  <ul style={{ margin: 4, paddingLeft: 16 }}>
                    {air_quality.pollutants.pm25 && (
                      <li>PM2.5: {air_quality.pollutants.pm25.concentration} μg/m³</li>
                    )}
                    {air_quality.pollutants.ozone && (
                      <li>O₃: {air_quality.pollutants.ozone.concentration} ppm</li>
                    )}
                    {air_quality.pollutants.no2 && (
                      <li>NO₂: {air_quality.pollutants.no2.concentration} ppb</li>
                    )}
                  </ul>
                )}

                <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  Updated: {new Date(last_updated).toLocaleString()}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};