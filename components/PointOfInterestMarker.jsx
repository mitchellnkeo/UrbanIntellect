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
  id,
  title,
  description,
  setFocusedPointOfInterest,
}) => {
  return (
    <CircleMarker
      center={center}
      pathOptions={{ color: "blue" }}
      radius={radius}
      eventHandlers={{
        click: () => {
          setFocusedPointOfInterest(id);
        },
      }}
    >
      <Popup>
        <b>{title}</b>
        <br /> {description}
      </Popup>
    </CircleMarker>
  );
};
