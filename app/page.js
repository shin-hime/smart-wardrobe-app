import Link from "next/link";
import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.landing}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <p className={styles.kicker}>CSC350 · Smart wardrobe</p>
            <h1 className={styles.heroTitle}>
              Dress with confidence for the weather you are in.
            </h1>
            <p className={`${styles.heroLead} mt-3 mb-4`}>
              Organize your clothes with photos, short notes, and weather tags.
              Your wardrobe is private to your account after you sign in.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link href="/signup" className="btn btn-dark btn-lg px-4 rounded-pill">
                Create account
              </Link>
              <Link
                href="/login"
                className="btn btn-outline-secondary btn-lg px-4 rounded-pill"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionMuted}`}
        id="about"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <h2 className={styles.sectionTitle}>About us</h2>
              <p className={`${styles.muted} lead mb-0`} style={{ fontSize: "1.05rem" }}>
                Smart Wardrobe helps you remember what you own and pick outfits
                that match the forecast. Upload items once, add a description,
                and tag them for sunny, rainy, or cloudy days.
              </p>
              <Link
                href="/about"
                className="btn btn-outline-secondary mt-4 rounded-pill"
              >
                Read more
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="how-it-works">
        <div className="container">
          <h2 className={`${styles.sectionTitle} mb-4`}>How it works</h2>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <ol className={styles.steps}>
                <li>
                  <strong>Create an account</strong> or log in. Your wardrobe
                  opens only after you are signed in.
                </li>
                <li>
                  <strong>Open Wardrobe</strong> and add each piece: photo,
                  name, description, and the weather it suits.
                </li>
                <li>
                  <strong>Filter by weather</strong> to see what fits the day
                  you are planning for.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <div className={`container ${styles.footerNote}`}>
        <p className="mb-0">
          New here? <Link href="/signup">Sign up</Link> to start.
        </p>
      </div>
    </main>
  );
}
