import Head from "next/head";
import styles from "../styles/Home.module.css";
import MapC from "../components/map.js";
import { useState } from "react";

export default function Home() {
  const [pointsOfInterest, setPointsOfInterest] = useState([
    {
      center: [47.6, -122.3321],
      radius: 15,
      title: "Point of Interest 1",
      description: "This is a point of interest",
    },
    {
      center: [47.637, -122.3134],
      radius: 30,
      title: "Point of Interest 2",
      description: "This is another point of interest",
    },
    {
      center: [47.65, -122.37],
      radius: 20,
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
          <MapC pointsOfInterest={pointsOfInterest} />
        </div>
        <div className={styles.focuscontainer}>
          <div className={styles.focusheading}>
            <button className={styles.focusheadingtext}>Filters</button>
            <button className={styles.focusheadingtext}>Menu</button>
          </div>
          <div className={styles.focuscontent}>
            {pointsOfInterest.map((p) => (
              <div className={styles.poiitem}>
                <p>{p.title}</p>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
