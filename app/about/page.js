import Link from "next/link";
import styles from "../home.module.css";

export const metadata = {
  title: "About us · Smart Wardrobe OOTD",
  description: "What Smart Wardrobe is for and how we approach your closet.",
};

export default function AboutPage() {
  return (
    <main>
      <section className={`${styles.section}`}>
        <div className="container col-lg-7">
          <h1 className={styles.sectionTitle}>About Smart Wardrobe</h1>
          <p className={`${styles.muted} lead`} style={{ fontSize: "1.05rem" }}>
            A practical wardrobe companion: a visual catalog of clothes you
            own, with notes you write and simple weather tags so planning stays
            quick.
          </p>
          <h2 className="h6 text-uppercase mt-5 mb-3 sw-muted-heading">
            What you can do
          </h2>
          <ul className={`${styles.muted} ps-3 mb-0`}>
            <li className="mb-2">Sign up and sign in so your data matches your session.</li>
            <li className="mb-2">
              Upload images with descriptions and weather conditions.
            </li>
            <li>Filter items by weather for the day you are dressing for.</li>
          </ul>
          <h2 className="h6 text-uppercase mt-5 mb-3 sw-muted-heading">
            Privacy note
          </h2>
          <p className={`${styles.muted} mb-0`}>
            In this development build, accounts and wardrobes live in server
            memory and reset when the app restarts. A production app would use
            a database and proper login security.
          </p>
          <div className="d-flex flex-wrap gap-2 mt-5">
            <Link href="/signup" className="btn btn-dark rounded-pill px-4">
              Sign up
            </Link>
            <Link
              href="/login"
              className="btn btn-outline-secondary rounded-pill px-4"
            >
              Log in
            </Link>
            <Link href="/" className="btn btn-link px-2">
              ← Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
