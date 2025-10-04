import Head from 'next/head';
import styles from '../styles/Home.module.css';
import MapC from '../components/map.js';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Urban Intellect</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.mapcontainer}>
          <MapC/>
        </div>
        <div className={styles.focuscontainer}>
          <div className={styles.focusheading}><button className={styles.focusheadingtext}>Filters</button><button className={styles.focusheadingtext}>Menu</button></div>
          <div className={styles.focuscontent}>
            <div className={styles.poiitem}>Point of Interest</div>
            <div className={styles.poiitem}>Point of Interest</div>
            <div className={styles.poiitem}>Point of Interest</div>
          </div>
        </div>

      </main>
    </div>
  );
}
