import Head from "next/head";
import styles from "../styles/Home.module.css";
import MapC from "../components/map.js";
import UrbanPlanningChatbot from "../components/UrbanPlanningChatbox.jsx";
import { useState } from "react";
import Drawer from '@mui/material/Drawer';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function Home() {
  const [focusedPointOfInterest, setFocusedPointOfInterest] = useState(null); //Now tracking focused poi by Center to push to map
  const [focusobj, setFocusObj] = useState(null)
  const [activeTab, setActiveTab] = useState("filters"); // New state for tab management
  const [filters, setFilters] = useState([0]);
  const [draweropen, setDrawer] = useState(false);
  const [pointsOfInterest, setPointsOfInterest] = useState([
    {
      id: "1",
      center: [47.6, -122.3321],
      title: "Point of Interest 1",
      description: "This is a point of interest",
    },
    {
      id: "2",
      center: [47.637, -122.3134],
      title: "Point of Interest 2",
      description: "This is another point of interest",
    },
    {
      id: "3",
      center: [47.64, -122.37],
      title: "Point of Interest 3",
      description: "This is another point of interest",
    },
  ]);

  function setFocus(id){
    let newfocus = pointsOfInterest.find(pointsOfInterest => pointsOfInterest.id === id);
    setFocusedPointOfInterest(newfocus.center);
    setFocusObj(newfocus);
    setDrawer(true);
  }
  function setTab(tab){
    if(tab == activeTab){setActiveTab("none")}else{setActiveTab(tab)}
    console.log(filters)
  }
  function toggleFilters(filter, value){
    if(filter == 1){
      if(value){setFilters(prev => prev.map((valuech, index) => index === 0 ? 1 : valuech));}
      if(!value){setFilters(prev => prev.map((valuech, index) => index === 0 ? 0 : valuech));}
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Urban Intellect</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {focusobj && <Drawer open={draweropen} onClose={() => {setDrawer(false)}}>
          <div className={styles.drawercontainer}> 
            <h1>{focusobj.title}</h1>
            <p>{focusobj.description}</p>
          </div>
        </Drawer>}
        <div className={styles.mapcontainer}>
          <MapC
            pointsOfInterest={pointsOfInterest}
            filters={filters}
            focusedPointOfInterest={focusedPointOfInterest}
            setFocusedPointOfInterest={setFocusedPointOfInterest}
          />
        </div>
        <div className={styles.focuscontainer}>
          <div className={styles.focusheading}>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "filters" ? styles.activeTab : ""}`}
              onClick={() => setTab("filters")}
            >
              Filters
            </button>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "menu" ? styles.activeTab : ""}`}
              onClick={() => setTab("menu")}
            >
              Menu
            </button>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "ai" ? styles.activeTab : ""}`}
              onClick={() => setTab("ai")}
            >
              AI
            </button>
          </div>
          <div className={styles.focuscontent}>
            {activeTab === "none" && (
              <>
                {pointsOfInterest.map((p) => (
                  <div
                    key={p.id}
                    className={`${styles.poiitem} ${
                      p.center === focusedPointOfInterest ? styles.focusedPoiitem : ""
                    }`}
                    onClick={() => {setFocus(p.id)}} 
                  >
                    <p>{p.title}</p>
                    <p>{p.description}</p>
                  </div>
                ))}
              </>
            )}

            {activeTab === "filters" && (
              <div className={styles.menuContent}>
                <h3>Filter Options</h3>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox checked={filters[0]} onChange={(event) => {toggleFilters(1 , event.target.checked)}} />} label="Population Density" />
  
                  </FormGroup>
              </div>
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
