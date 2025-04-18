"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Dumbbell,
  Crown,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Instagram,
  Mail,
} from "lucide-react";
// import "./faq.css";

const Page = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "What is TrainifAI?",
      answer:
        "TrainifAI is an AI-powered fitness platform that creates personalized workout and nutrition plans based on your goals, fitness level, and preferences. Our advanced AI takes the guesswork out of fitness planning, helping you achieve results more efficiently.",
    },
    {
      id: 2,
      question: "How do I get started with TrainifAI?",
      answer:
        "Getting started is easy! Simply sign up for an account, complete the fitness assessment questionnaire, and our AI will generate a customized plan for you. You can then access your plan through your dashboard and start your fitness journey immediately.",
    },
    {
      id: 3,
      question: "What's included in the premium subscription?",
      answer:
        "Premium subscribers get access to unlimited personalized workout and nutrition plans, advanced progress tracking, exclusive exercise variations, meal prep guides, and priority customer support. You'll also receive regular plan updates based on your progress.",
    },
    {
      id: 4,
      question: "Can I customize my fitness plan?",
      answer:
        "Absolutely! While our AI creates an optimized plan based on your inputs, you can always modify aspects of your plan. You can adjust workout intensity, swap exercises, and more to make the plan work better for you.",
    },
    {
      id: 5,
      question: "How often are plans updated?",
      answer:
        "As a premium user, your plan evolves with you —  update it every 3 to 4 months to match your growth, goals, and momentum. Ready for a change sooner? You’re in control — request an update anytime and keep pushing forward.",
    },
    {
      id: 6,
      question: "Is TrainifAI suitable for beginners?",
      answer:
        "Yes! TrainifAI is designed for all fitness levels, from complete beginners to advanced athletes. Our AI tailors the difficulty and complexity of your plan to match your current fitness level and experience.",
    },
    {
      id: 7,
      question: "What equipment do I need?",
      answer:
        "That's entirely up to you! During setup, you can specify what equipment you have access to (home gym, full commercial gym, minimal equipment, etc.), and our AI will design a plan around those resources. We have effective options for all setups.",
    },
    {
      id: 8,
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your premium subscription at any time through your account settings. Your premium features will remain active until the end of your current billing period.",
    },
  ];

  const toggleQuestion = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  return (
    <div className="faq-page">
      {/* Navigation Bar */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <a href="/">
              <ArrowLeft className="nav-logo" />
            </a>
            <Dumbbell className="nav-logo" />
            <span className="nav-title">TrainifAI</span>
          </div>
          {/* <div className="btns-wrapper">
            <Link href="/createPlan">
              <button className="btn btn-primary">Create Plan</button>
            </Link>

            <div className="nav-buttons">
              <Crown strokeWidth={3} className="crown" />
            </div>
          </div> */}
        </div>
      </nav>

      {/* FAQ Header Section */}
      <div className="faq-header">
        <div className="faq-wrapper">
          <div className="faq-header-content">
            <h1>Frequently Asked Questions</h1>
            <p>
              Find answers to common questions about TrainifAI and how it can
              help you achieve your fitness goals.
            </p>
          </div>
        </div>

        {/* FAQ Content Section */}
        <div className="faq-content">
          <div className="faq-container">
            {faqData.map((faq) => (
              <div
                key={faq.id}
                className={`faq-item ${
                  activeQuestion === faq.id ? "active" : ""
                }`}
              >
                <div
                  className="faq-question"
                  onClick={() => toggleQuestion(faq.id)}
                >
                  <h3>{faq.question}</h3>
                  {activeQuestion === faq.id ? (
                    <ChevronUp className="faq-icon" />
                  ) : (
                    <ChevronDown className="faq-icon" />
                  )}
                </div>
                {activeQuestion === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="faq-contact">
            <h2>Still have questions?</h2>
            <p>
              Our support team is here to help you with any additional questions
              you might have.
            </p>
            <Link href="/contact">
              <button className="btn btn-primary">Contact Us</button>
            </Link>
          </div>
        </div>

        {/* Footer could go here */}
      </div>
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-section">
            {/* <div className="footer-logo">TrainifAI</div> */}
            <div className="footer-text">
              © 2025 TrainifAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
