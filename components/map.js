import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { PointOfInterestMarker } from "./PointOfInterestMarker";

// Dynamically import all react-leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const fillBlueOptions = { fillColor: "blue" };
const blackOptions = { color: "black" };
const limeOptions = { color: "lime" };
const purpleOptions = { color: "purple" };
const redOptions = { color: "red" };
const blueOptions = { color: "blue" };

export default function MapC({ pointsOfInterest, setFocusedPointOfInterest }) {
  const [L, setLeaflet] = useState(null);
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    // ✅ Import leaflet dynamically so it only loads in browser
    (async () => {
      const leaflet = await import("leaflet");
      const newIcon = new leaflet.Icon({
        iconUrl: "/leaflet/marker-icon-2x.png",
        iconSize: [24, 40],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
      setLeaflet(leaflet);
      setIcon(newIcon);
    })();
  }, []);

  // Wait for leaflet to load before rendering
  if (!L || !icon) return null;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[47.6062, -122.3321]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[47.6062, -122.3321]} icon={icon}>
          <Popup>
            <b>Seattle Center</b>
            <br /> Example point of interest.
          </Popup>
        </Marker>
        {pointsOfInterest.map((p) => (
          <PointOfInterestMarker
            {...p}
            setFocusedPointOfInterest={setFocusedPointOfInterest}
          />
        ))}
      </MapContainer>
    </div>
  );
}
