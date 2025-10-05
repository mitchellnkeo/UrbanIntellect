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
  id,
  title,
  description,
  setFocus,
}) => {
  return (
    <CircleMarker
      center={center}
      pathOptions={{ color: "blue" }}
      radius={30}
      eventHandlers={{
        click: () => {
          setFocus(id);
        },
      }}
    >
      {/* <Popup>
        <b>{title}</b>
        <br /> {description}
      </Popup> */}
    </CircleMarker>
  );
};
