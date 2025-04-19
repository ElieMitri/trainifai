import React from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";

const PrivacyPage = () => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="page-container">
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <a href="/">
              <ArrowLeft className="nav-logo" />
            </a>
            <Dumbbell className="nav-logo" />
            <span className="nav-title">TrainifAI</span>
          </div>
        </div>
      </nav>

      <div className="content-wrapper">
        <main className="main-content-privacy">
          <h1 className="page-title">Privacy Policy</h1>
          <p className="effective-date">
            <strong>Effective Date:</strong> {today}
          </p>

          <p className="privacy-introduction">
            At <strong>TrainifAI</strong>, your privacy is important to us. This
            Privacy Policy explains how we collect, use, and protect your
            information when you use our services.
          </p>

          <section className="terms-section">
            <h2>1. Information We Collect</h2>
            <p>
              We collect several types of information to provide and improve our
              services:
            </p>
            <ul className="privacy-list">
              <li>
                <strong>Personal Information:</strong> Name, email, profile
                data.
              </li>
              <li>
                <strong>Health & Fitness Data:</strong> Weight, goals, workouts,
                meal preferences.
              </li>
              <li>
                <strong>Device & Usage Data:</strong> IP address, browser type,
                usage stats.
              </li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>2. How We Use Your Information</h2>
            <p>
              We use your data to deliver personalized fitness plans, optimize
              the app functionality, and communicate with you about your account
              and services.
            </p>
          </section>

          <section className="terms-section">
            <h2>3. Data Sharing</h2>
            <p>
              We don't sell your personal data. We only share it with trusted
              service providers and partners when necessary to provide our
              services.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. Your Choices</h2>
            <p>
              You can edit or delete your data, opt out of marketing messages,
              or request full account deletion by contacting us at{" "}
              <a href="mailto:trainifai@gmail.com">trainifai@gmail.com</a>.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Data Security</h2>
            <p>
              We implement encryption and security measures to protect your
              data, but no system is 100% secure. We continuously monitor and
              improve our security practices.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Children's Privacy</h2>
            <p>
              Our application is not intended for children under 13. We do not
              knowingly collect personal information from children under 13
              years of age.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We'll notify you
              of significant changes via email or in-app notifications.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. International Users</h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your own, where privacy laws may be different.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Contact Information</h2>
            <p>
              For inquiries regarding this Privacy Policy, please contact our
              support team at:{" "}
              <a href="mailto:trainifai@gmail.com">trainifai@gmail.com</a>
            </p>
          </section>
        </main>
      </div>
      <footer className="page-footer">
        <p>© {new Date().getFullYear()} TrainifAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPage;
