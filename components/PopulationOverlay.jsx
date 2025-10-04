import dynamic from "next/dynamic";
import populationDensityData from "../assets/seattle_population_density.json";

const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  {
    ssr: false,
  }
);

const Popover = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popover),
  {
    ssr: false,
  }
);

// For displaying things like pollution and population density
export const PopulationOverlay = () => {
  return populationDensityData.data.map((d) => {
    const radius = d.size / 500;
    const fillColor = radius > 8 ? "red" : radius > 5 ? "orange" : "yellow";

    return (
      <CircleMarker
        center={[d.lat, d.lng]}
        pathOptions={{ fillColor, stroke: false, opacity: 1 }}
        radius={radius}
      ></CircleMarker>
    );
  });
};
