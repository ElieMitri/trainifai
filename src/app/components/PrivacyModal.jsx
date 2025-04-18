import React from "react";

const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });


  return (
    <div className="privacy-modal__overlay" onClick={onClose}>
      <div
        className="privacy-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="privacy-modal__header">
          <h2 className="privacy-modal__title">Privacy Policy</h2>
          <button className="privacy-modal__close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="privacy-modal__content">
          <p className="privacy-modal__effective-date">
            <strong>Effective Date:</strong> {today}
          </p>

          <p className="privacy-modal__introduction">
            At{" "}
            <strong className="privacy-modal__company-name">TrainifAI</strong>,
            your privacy is important to us. This Privacy Policy explains how we
            collect, use, and protect your information when you use our
            services.
          </p>

          <div className="privacy-modal__section">
            <h4 className="privacy-modal__section-title">
              1. Information We Collect
            </h4>
            <ul className="privacy-modal__list">
              <li className="privacy-modal__list-item">
                <strong className="privacy-modal__data-type">
                  Personal Information:
                </strong>{" "}
                Name, email, profile data.
              </li>
              <li className="privacy-modal__list-item">
                <strong className="privacy-modal__data-type">
                  Health & Fitness Data:
                </strong>{" "}
                Weight, goals, workouts, meal preferences.
              </li>
              <li className="privacy-modal__list-item">
                <strong className="privacy-modal__data-type">
                  Device & Usage Data:
                </strong>{" "}
                IP address, browser type, usage stats.
              </li>
            </ul>
          </div>

          <div className="privacy-modal__section">
            <h4 className="privacy-modal__section-title">
              2. How We Use Your Information
            </h4>
            <p className="privacy-modal__section-text">
              We use your data to deliver personalized plans, optimize the app,
              and communicate with you.
            </p>
          </div>

          <div className="privacy-modal__section">
            <h4 className="privacy-modal__section-title">3. Data Sharing</h4>
            <p className="privacy-modal__section-text">
              We don't sell your data. We only share it with trusted partners
              when necessary.
            </p>
          </div>

          <div className="privacy-modal__section">
            <h4 className="privacy-modal__section-title">4. Your Choices</h4>
            <p className="privacy-modal__section-text">
              You can edit or delete your data, opt out of messages, or request
              full deletion via{" "}
              <a
                href="mailto:support@trainifai.com"
                className="privacy-modal__email-link"
              >
                trainifai@gmail.com
              </a>
              .
            </p>
          </div>

          <div className="privacy-modal__section">
            <h4 className="privacy-modal__section-title">5. Data Security</h4>
            <p className="privacy-modal__section-text">
              We use encryption and security measures, but no system is 100%
              secure.
            </p>
          </div>

          <div className="privacy-modal__section">
            <h4 className="privacy-modal__section-title">
              6. Children's Privacy
            </h4>
            <p className="privacy-modal__section-text">
              Our app is not intended for children under 13.
            </p>
          </div>

          <div className="privacy-modal__section">
            <h4 className="privacy-modal__section-title">
              7. Changes to This Policy
            </h4>
            <p className="privacy-modal__section-text">
              We'll notify you of major changes via email or in-app messages.
            </p>
          </div>
        </div>

        <div className="privacy-modal__footer">
          <button className="privacy-modal__accept-button" onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
