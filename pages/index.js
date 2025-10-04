import Head from "next/head";
import styles from "../styles/Home.module.css";
import MapC from "../components/map.js";
import UrbanPlanningChatbot from "../components/UrbanPlanningChatbox.jsx";
import { useState } from "react";

export default function Home() {
  const [focusedPointOfInterest, setFocusedPointOfInterest] = useState(null);
  const [activeTab, setActiveTab] = useState("filters"); // New state for tab management
  const [pointsOfInterest, setPointsOfInterest] = useState([
    {
      id: "1",
      center: [47.6, -122.3321],
      radius: 15,
      title: "Point of Interest 1",
      description: "This is a point of interest",
    },
    {
      id: "2",
      center: [47.637, -122.3134],
      radius: 30,
      title: "Point of Interest 2",
      description: "This is another point of interest",
    },
    {
      id: "3",
      center: [47.64, -122.37],
      radius: 45,
      title: "Point of Interest 3",
      description: "This is another point of interest",
    },
  ]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Urban Intellect</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.mapcontainer}>
          <MapC
            pointsOfInterest={pointsOfInterest}
            setFocusedPointOfInterest={setFocusedPointOfInterest}
          />
        </div>
        <div className={styles.focuscontainer}>
          <div className={styles.focusheading}>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "filters" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("filters")}
            >
              Filters
            </button>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "menu" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("menu")}
            >
              Menu
            </button>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "ai" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("ai")}
            >
              AI
            </button>
          </div>
          <div className={styles.focuscontent}>
            {activeTab === "filters" && (
              <>
                {pointsOfInterest.map((p) => (
                  <div
                    key={p.id}
                    className={`${styles.poiitem} ${
                      p.id === focusedPointOfInterest ? styles.focusedPoiitem : ""
                    }`}
                    onClick={() => setFocusedPointOfInterest(p.id)} // TODO when click this needs to open the popup of that poi
                  >
                    <p>{p.title}</p>
                    <p>{p.description}</p>
                  </div>
                ))}
              </>
            )}
            {activeTab === "menu" && (
              <div className={styles.menuContent}>
                <h3>Menu Options</h3>
                <p>Menu content will go here</p>
              </div>
            )}
            {activeTab === "ai" && (
              <div className={styles.aiContent}>
                <UrbanPlanningChatbot 
                  style={{ height: '100%', width: '100%' }}
                  className={styles.aiChatbot}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
