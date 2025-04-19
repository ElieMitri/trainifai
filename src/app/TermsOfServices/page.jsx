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
          <h1 className="page-title">Terms of Service</h1>
          <p className="effective-date">
            <strong>Effective Date:</strong> {today}
          </p>

          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the TrainifAI platform and services, you
              acknowledge that you have read, understood, and agree to be bound
              by these Terms of Service and our Privacy Policy.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Use of the Platform</h2>
            <p>
              TrainifAI is intended for personal fitness purposes only. Users
              are prohibited from misusing, exploiting, or attempting to gain
              unauthorized access to any aspect of the platform.
            </p>
          </section>

          <section className="terms-section">
            <h2>3. User Content</h2>
            <p>
              You retain ownership of any content you submit to TrainifAI. We
              utilize this content solely for the purpose of providing and
              improving our services to you.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. Subscriptions & Billing</h2>
            <p>
              Premium subscription plans automatically renew unless explicitly
              cancelled by the user through their account settings or respective
              application store. Terms of payment are outlined in detail in our
              subscription agreement.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Health Disclaimer</h2>
            <p>
              TrainifAI provides general fitness guidance and is not a
              substitute for professional medical advice, diagnosis, or
              treatment. Users are strongly advised to consult with qualified
              healthcare professionals before beginning any fitness program or
              making health-related decisions.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Account Termination</h2>
            <p>
              TrainifAI reserves the right to suspend or terminate accounts that
              violate these Terms of Service, at our sole discretion and without
              prior notice.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Limitation of Liability</h2>
            <p>
              Use of TrainifAI is at the user's own risk. TrainifAI and its
              parent company shall not be liable for any injuries, losses, or
              damages arising from the use of our platform or services.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in
              accordance with the laws of the user's region or jurisdiction,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Contact Information</h2>
            <p>
              For inquiries regarding these Terms of Service, please contact our
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
