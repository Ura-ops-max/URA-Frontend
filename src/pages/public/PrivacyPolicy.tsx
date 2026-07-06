import LegalPage from './LegalPage';

const PrivacyPolicy = () => (
  <LegalPage
    title="Privacy Policy"
    updated="June 2026"
    intro="Your privacy matters to us. This policy explains what information URA collects, how we use it, and the choices you have."
    sections={[
      {
        heading: 'Information We Collect',
        body: (
          <p>
            We collect the details you provide when you register (such as your name, email, and phone number),
            information about your listings and orders, and technical data like your device and usage patterns.
          </p>
        ),
      },
      {
        heading: 'How We Use Your Information',
        body: (
          <p>
            We use your information to operate the marketplace, process payments, personalise your experience,
            keep the platform secure, and communicate with you about your account and orders.
          </p>
        ),
      },
      {
        heading: 'Payments',
        body: (
          <p>
            Payment and escrow transactions are handled by our payment partner, Payluk. We share only the
            information needed to complete a transaction and never store your full card details.
          </p>
        ),
      },
      {
        heading: 'Sharing Your Information',
        body: (
          <p>
            We do not sell your personal data. We share information with service providers who help us run URA,
            and when required by law. Sellers and buyers see only the details necessary to complete an order.
          </p>
        ),
      },
      {
        heading: 'Your Rights',
        body: (
          <p>
            You can access, update, or request deletion of your personal information at any time by contacting
            us. You may also opt out of non-essential communications.
          </p>
        ),
      },
      {
        heading: 'Data Security',
        body: (
          <p>
            We use encryption and industry-standard safeguards to protect your data. No system is completely
            secure, but we work continuously to keep your information safe.
          </p>
        ),
      },
    ]}
  />
);

export default PrivacyPolicy;
