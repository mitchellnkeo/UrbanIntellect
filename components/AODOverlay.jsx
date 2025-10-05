import dynamic from "next/dynamic";
import aodData from "../assets/aggregate_aod_data.json"; // adjust filename if needed

const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export const AODOverlay = () => {
  return aodData.features.map((feature, index) => {
    const { lat, lon, aod } = feature.properties;
    const { coordinates } = feature.geometry;

    // Optional: scale circle size and color by AOD
    const radius = aod * 100; // adjust scaling to your liking
    const fillColor =
      aod > 0.4 ? "red" : aod > 0.3 ? "orange" : aod > 0.2 ? "yellow" : "green";

    return (
      <CircleMarker
        key={index}
        center={[coordinates[1], coordinates[0]]}
        pathOptions={{ fillColor, color: fillColor, fillOpacity: 0.5, stroke: false }}
        radius={radius}
      >
        <Popup>
          <b>Aerosol Optical Depth (AOD)</b>
          <br />
          Value: {aod.toFixed(3)}
          <br />
          Lat: {coordinates[1].toFixed(3)} | Lon: {coordinates[0].toFixed(3)}
        </Popup>
      </CircleMarker>
    );
  });
};