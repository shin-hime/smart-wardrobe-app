import Link from "next/link";
import Image from "next/image";
import styles from "./home.module.css";
import { TRENDING_OUTFITS } from "@/lib/trending";
import { getSessionUserIdFromCookies } from "@/lib/session";

export default async function Home() {
  const userId = await getSessionUserIdFromCookies();
  const isAuthed = Boolean(userId);
  return (
    <main className={styles.landing}>
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="/young-japanese-woman-portrait-sitting-chair.jpg"
            alt="Smart Wardrobe"
            fill
            className={styles.heroImage}
            priority
          />
        </div>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>CSC350 · Smart wardrobe</p>
            <h1 className={styles.heroTitle}>
              Build your wardrobe once, get outfit ideas every day.
            </h1>
            <p className={styles.heroLead}>
              Keep your pieces organized with photos and weather tags. Plan
              faster with a clean view of what works for sunny, rainy, and
              cloudy days.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {isAuthed ? (
                <Link
                  href="#trending"
                  className={styles.heroButton}
                >
                  Explore Trending
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className={styles.heroButton}
                  >
                    Create account
                  </Link>
                  <Link
                    href="/login"
                    className={styles.heroButtonOutline}
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionMuted}`}
        id="about"
      >
        <div className="container">
          <div className={styles.showcaseGrid}>
            <div className={styles.showcaseCard}>
              <Image
                src="/wardrobe-renovation-winter.jpg"
                alt="Organized wardrobe shelves"
                width={1200}
                height={800}
                className={styles.sectionImage}
              />
            </div>
            <div className={styles.showcaseContent}>
              <p className={styles.cardKicker}>About smart wardrobe</p>
              <h2 className={styles.sectionTitle}>Built for easy daily planning</h2>
              <p className={`${styles.muted} mb-0`}>
                Smart Wardrobe helps you remember what you own and pick outfits
                that match the forecast. Upload items once, add details, and
                tag each piece for sunny, rainy, cloudy, or all-weather use.
              </p>
              <Link
                href="/about"
                className={`${styles.heroButtonOutline} mt-4`}
              >
                Read more
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="how-it-works">
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.cardKicker}>How it works</p>
            <h2 className={`${styles.sectionTitle} mb-0`}>
              A clean flow from closet to outfit
            </h2>
          </div>
          <div className={styles.featureGrid}>
            <article className={styles.featureCard}>
              <Image
                src="/close-up-woman-looking-wardrobe.jpg"
                alt="Choosing clothing from wardrobe"
                width={1000}
                height={700}
                className={styles.featureImage}
              />
              <h3 className={styles.featureTitle}>1. Save your clothes</h3>
              <p className={styles.muted}>
                Add photo, item type, and weather tags so your wardrobe stays
                organized.
              </p>
            </article>
            <article className={styles.featureCard}>
              <Image
                src="/clothes-donations-collected-charity.jpg"
                alt="Grouped clothes ready to wear"
                width={1000}
                height={700}
                className={styles.featureImage}
              />
              <h3 className={styles.featureTitle}>2. Filter by weather</h3>
              <p className={styles.muted}>
                Switch between sunny, rain, and cloudy views to plan faster.
              </p>
            </article>
            <article className={styles.featureCard}>
              <Image
                src="/wardrobe-renovation-winter.jpg"
                alt="Neatly arranged wardrobe"
                width={1000}
                height={700}
                className={styles.featureImage}
              />
              <h3 className={styles.featureTitle}>3. Get outfit ideas</h3>
              <p className={styles.muted}>
                Use OOTD and suggestion mode to discover ready-to-wear
                combinations.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* QUIZ BANNER SECTION */}
      <section className={styles.section} style={{ backgroundColor: 'var(--sw-mocha)', color: 'var(--sw-cream)' }}>
        <div className="container text-center py-5">
          <h2 className="mb-3" style={{ fontWeight: 700 }}>Don't know what to wear?</h2>
          <p className="mb-4" style={{ maxWidth: 600, margin: '0 auto', fontSize: '1.1rem', color: 'rgba(240, 231, 213, 0.85)' }}>
            Take our quick 1-minute style quiz to discover your personal aesthetic and get tailored outfit recommendations.
          </p>
          <Link href="/quiz" className="btn rounded-pill px-4 py-2 fw-semibold" style={{ backgroundColor: 'var(--sw-cream)', color: 'var(--sw-mocha)' }}>
            Discover Personal Style
          </Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionMuted}`} id="trending">
        <div className="container">
          <div className={`${styles.sectionHeader} d-flex justify-content-between align-items-end gap-3 flex-wrap`}>
            <div>
              <p className={styles.cardKicker}>Trending ideas</p>
              <h2 className={`${styles.sectionTitle} mb-0`}>
                Outfit inspiration this week
              </h2>
            </div>
            <Link href="/ootd" className={styles.heroButtonOutline}>
              Try in OOTD
            </Link>
          </div>

          <div className={styles.trendingGrid}>
            {TRENDING_OUTFITS.map((trend) => (
              <article key={trend.id} className={styles.trendCard}>
                <Image
                  src={trend.image}
                  alt={trend.alt}
                  width={1000}
                  height={1333}
                  className={styles.trendImage}
                />
                <div className={styles.trendBody}>
                  <h3 className={styles.trendTitle}>{trend.title}</h3>
                  <p className={styles.muted}>{trend.description}</p>
                  <div className={styles.trendTags}>
                    {trend.tags.map((tag) => (
                      <span key={`${trend.id}-${tag}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
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
