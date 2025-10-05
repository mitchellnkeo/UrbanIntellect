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
  onPointHover,
  onPointLeave,
  isAIRecommendation = false,
  score,
  density,
  reasons = []
}) => {
  // Different styling for AI recommendations
  const markerColor = isAIRecommendation ? "#4CAF50" : "blue";
  const markerRadius = isAIRecommendation ? 35 : 30;
  
  return (
    <CircleMarker
      center={center}
      pathOptions={{ 
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.6,
        weight: 2
      }}
      radius={markerRadius}
      eventHandlers={{
        click: (e) => {
          // pass clientX so drawer can size to stop before the clicked POI
          const clientX = e.originalEvent?.clientX ?? null;
          setFocus(id, clientX);
        },
        mouseover: (e) => {
          if (onPointHover) {
            onPointHover({
              id,
              title,
              description,
              isAIRecommendation,
              score,
              density,
              reasons
            }, e.originalEvent);
          }
        },
        mouseout: () => {
          if (onPointLeave) {
            onPointLeave();
          }
        }
      }}
    >
      {/* <Popup>
        <b>{title}</b>
        <br /> {description}
      </Popup> */}
    </CircleMarker>
  );
};
