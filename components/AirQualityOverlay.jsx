import dynamic from "next/dynamic";
import pscaaAirQualityData from "../assets/seattle_pscaa_air_quality_data.json";

// Dynamically import HeatmapLayer to avoid SSR issues
const HeatmapLayer = dynamic(
  () => import("react-leaflet-heatmap-layer-v3").then((mod) => mod.HeatmapLayer),
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

  return (
    <HeatmapLayer
      fitBoundsOnLoad
      fitBoundsOnUpdate
      points={heatmapPoints}
      longitudeExtractor={(p) => p[1]}
      latitudeExtractor={(p) => p[0]}
      intensityExtractor={(p) => p[2]}
      radius={80}            // controls spread - increased for better coverage
      blur={35}               // controls smoothness - increased for smoother blending
      max={100}               // max intensity (AQI scale 0-100+)
      minOpacity={0.4}
    />
  );
};
