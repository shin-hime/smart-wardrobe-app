import Link from "next/link";
import Image from "next/image";
import styles from "./about.module.css";

export const metadata = {
  title: "About us · Smart Wardrobe OOTD",
  description: "What Smart Wardrobe is for and how we approach your closet.",
};

export default function AboutPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.pageTitle}>ABOUT US</h1>
      
      <div className={styles.heroImageContainer}>
        <Image 
          src="/men-beige-shirt-minimal-outfit.jpg" 
          alt="Wardrobe Hero" 
          width={1200} 
          height={450} 
          className={styles.heroImage}
          priority
        />
      </div>

      <section className={styles.introSection}>
        <div className={styles.introLarge}>
          Smart Wardrobe was created with a clear purpose: to make planning your daily outfits simple, visual, and fast.
        </div>
        <div className={styles.introSmall}>
          A practical wardrobe companion: a visual catalog of clothes you own, with notes you write and simple weather tags so planning stays quick.
        </div>
      </section>

      <section className={styles.featuresGrid}>
        {/* Left Column */}
        <div>
          <div className={styles.featureItem}>
            <div className={styles.featureHeader}>What you can do?</div>
            <div className={styles.featureLargeText}>
              Upload images with descriptions and weather conditions.
            </div>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.featureHeader}>Data Match</div>
            <div className={styles.featureLargeText}>
              Sign up and sign in so your data matches your session.
            </div>
            <div className={styles.featureSmallText}>
              Filter items by weather for the day you are dressing for. Ensure your comfort and style are always a priority.
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className={styles.featureItem}>
            <div className={styles.featureHeader}>Privacy Note</div>
            <div className={styles.featureSmallText}>
              In this development build, accounts and wardrobes live in server memory and reset when the app restarts.
            </div>
            <div className={styles.featureSmallText}>
              A production app would use a database and proper login security.
            </div>
            <div className={styles.featureImageContainer}>
               <Image 
                  src="/young-man-portrait.jpg" 
                  alt="Young man portrait" 
                  width={600} 
                  height={280} 
                  className={styles.featureImage}
               />
            </div>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.featureHeader}>Our system</div>
            <div className={styles.featureSmallText}>
              Organize your daily style with an easy-to-use digital catalog. Experience the convenience of having your closet at your fingertips.
            </div>
            <Link href="/" className={styles.linkItem}>
              EXPLORE WARDROBE ↗
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.bottomSection}>
        <div className={styles.bottomSmall}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          WITH SMART WARDROBE
        </div>
        <div className={styles.bottomLarge}>
          We make every morning a harmonious blend of style and discovery. Start your organization with Smart Wardrobe - sign up now!
        </div>
        <div className={styles.bottomLinks}>
          <Link href="/signup" className={styles.linkItem}>
            SIGN UP ↗
          </Link>
          <Link href="/login" className={styles.linkItem}>
            LOG IN ↗
          </Link>
        </div>
      </section>
    </main>
  );
}
