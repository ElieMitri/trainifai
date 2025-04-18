import React from "react";

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });


  return (
    <div className="terms-modal__overlay" onClick={onClose}>
      <div
        className="terms-modal__container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="terms-modal__header">
          <h2 className="terms-modal__title">Terms of Service</h2>
          <button className="terms-modal__close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="terms-modal__content">
          <p className="terms-modal__effective-date">
            <strong>Effective Date:</strong> {today}
          </p>

          <div className="terms-modal__section">
            <h4 className="terms-modal__section-title">
              1. Acceptance of Terms
            </h4>
            <p className="terms-modal__section-text">
              By using TrainifAI, you agree to these Terms and our Privacy
              Policy.
            </p>
          </div>

          <div className="terms-modal__section">
            <h4 className="terms-modal__section-title">
              2. Use of the Platform
            </h4>
            <p className="terms-modal__section-text">
              Use TrainifAI for personal fitness only. Don't misuse or exploit
              the platform.
            </p>
          </div>

          <div className="terms-modal__section">
            <h4 className="terms-modal__section-title">3. User Content</h4>
            <p className="terms-modal__section-text">
              You own your content. We use it only to provide services to you.
            </p>
          </div>

          <div className="terms-modal__section">
            <h4 className="terms-modal__section-title">
              4. Subscriptions & Billing
            </h4>
            <p className="terms-modal__section-text">
              Premium plans auto-renew unless cancelled through your account or
              app store.
            </p>
          </div>

          <div className="terms-modal__section">
            <h4 className="terms-modal__section-title">5. Health Disclaimer</h4>
            <p className="terms-modal__section-text">
              TrainifAI offers general guidance and is not a medical provider.
              Consult a professional before making health decisions.
            </p>
          </div>

          <div className="terms-modal__section">
            <h4 className="terms-modal__section-title">
              6. Account Termination
            </h4>
            <p className="terms-modal__section-text">
              We may suspend or terminate accounts that violate our terms.
            </p>
          </div>

          <div className="terms-modal__section">
            <h4 className="terms-modal__section-title">
              7. Limitation of Liability
            </h4>
            <p className="terms-modal__section-text">
              Use TrainifAI at your own risk. We're not liable for injuries or
              losses.
            </p>
          </div>

          <div className="terms-modal__section">
            <h4 className="terms-modal__section-title">8. Governing Law</h4>
            <p className="terms-modal__section-text">
              These terms follow the laws of your region or jurisdiction.
            </p>
          </div>

          <div className="terms-modal__section">
            <h4 className="terms-modal__section-title">9. Contact</h4>
            <p className="terms-modal__section-text">
              Questions? Email us at{" "}
              <a
                href="mailto:support@trainifai.com"
                className="terms-modal__email-link"
              >
                trainifai@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div className="terms-modal__footer">
          <button className="terms-modal__accept-button" onClick={onClose}>
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
