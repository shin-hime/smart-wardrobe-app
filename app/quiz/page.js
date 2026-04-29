"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./quiz.module.css";

const QUESTIONS = [
  {
    id: 1,
    question: "Choose your ideal weekend outfit.",
    options: [
      { text: "Simple & Clean", image: "/minimalist.jpg", style: "Minimalist" },
      { text: "Oversized & Cool", image: "/street.jpg", style: "Streetwear" },
      { text: "Retro & Thrifted", image: "/vintage.jpg", style: "Vintage" },
      { text: "Sharp & Tailored", image: "/classic.jpg", style: "Classic" },
    ],
  },
  {
    id: 2,
    question: "Pick a color palette.",
    options: [
      { text: "Neutrals & Black", image: "/palette_2.jpg", style: "Minimalist" },
      { text: "Bold & High Contrast", image: "/palette_4.jpg", style: "Streetwear" },
      { text: "Earthy & Muted", image: "/acc_2.jpg", style: "Vintage" },
      { text: "Navy & Beige", image: "/palette_3.jpg", style: "Classic" },
    ],
  },
  {
    id: 3,
    question: "Which accessory is a must-have?",
    options: [
      { text: "Sleek Watch", image: "/acc_4.jpg", style: "Minimalist" },
      { text: "Chunky Sneakers", image: "/acc_3.jpg", style: "Streetwear" },
      { text: "Round Sunglasses", image: "/palette_1.jpg", style: "Vintage" },
      { text: "Leather Belt", image: "/acc_1.jpg", style: "Classic" },
    ],
  },
];

export default function QuizPage() {
  // We use standard React state, matching the class reference pattern
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState({
    Minimalist: 0,
    Streetwear: 0,
    Vintage: 0,
    Classic: 0,
  });
  const [showResult, setShowResult] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (data.user) {
          setIsAuthed(true);
        }
      } catch (err) {
        setIsAuthed(false);
      }
    }
    checkAuth();
  }, []);

  // When an option is clicked, increase the score for that style
  const handleOptionClick = (style) => {
    const newScores = { ...scores };
    newScores[style] += 1;
    setScores(newScores);

    // Move to next question or show result
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  // Determine the highest score
  const getTopAesthetic = () => {
    let topStyle = "Minimalist";
    let maxScore = 0;
    
    for (const [style, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        topStyle = style;
      }
    }
    return topStyle;
  };

  if (showResult) {
    const aesthetic = getTopAesthetic();
    
    return (
      <main className={styles.container}>
        <div className={styles.resultContainer}>
          <p className="text-muted text-uppercase fw-bold mb-2">Your Personal Style is</p>
          <h1 className={styles.resultTitle}>{aesthetic}</h1>
          <p className={styles.resultDescription}>
            You lean towards a {aesthetic.toLowerCase()} wardrobe. Start building your perfect closet today!
          </p>
          
          <div className="d-flex justify-content-center gap-3 mt-4">
            {isAuthed ? (
              <Link href="/wardrobe" className="btn btn-dark rounded-pill px-4 py-2">
                Open Wardrobe & Start Building
              </Link>
            ) : (
              <Link href="/signup" className="btn btn-dark rounded-pill px-4 py-2">
                Sign Up & Start Building
              </Link>
            )}
            <Link href="/" className="btn btn-outline-secondary rounded-pill px-4 py-2">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Find Your Aesthetic</h1>
      
      <div className="mb-4 text-center text-muted">
        Question {currentStep + 1} of {QUESTIONS.length}
      </div>

      <h2 className={styles.questionText}>{currentQuestion.question}</h2>

      <div className={styles.optionsGrid}>
        {currentQuestion.options.map((option, index) => (
          <div 
            key={index} 
            className={styles.optionCard}
            onClick={() => handleOptionClick(option.style)}
          >
            {option.image ? (
              <img src={option.image} alt={option.text} className={styles.optionImage} />
            ) : (
              <div className={styles.optionEmoji}>{option.emoji}</div>
            )}
            <div className={styles.optionText}>{option.text}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
