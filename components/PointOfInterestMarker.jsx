import dynamic from "next/dynamic";

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  {
    ssr: false,
  }
);

// The red circles
export const PointOfInterestMarker = ({
  center,
  radius,
  title,
  description,
}) => {
  return (
    <CircleMarker
      center={center}
      pathOptions={{ color: "red" }}
      radius={radius}
    >
      <Popup>
        <b>{title}</b>
        <br /> {description}
      </Popup>
    </CircleMarker>
  );
};
