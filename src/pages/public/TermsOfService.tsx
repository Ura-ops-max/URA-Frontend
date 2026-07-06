import LegalPage from './LegalPage';

const TermsOfService = () => (
  <LegalPage
    title="Terms of Service"
    updated="June 2026"
    intro="Welcome to URA. By creating an account or using our marketplace, you agree to these Terms of Service. Please read them carefully."
    sections={[
      {
        heading: 'Using URA',
        body: (
          <p>
            You must be at least 18 years old to buy or sell on URA. You are responsible for keeping your
            account credentials secure and for all activity that happens under your account.
          </p>
        ),
      },
      {
        heading: 'Buying and Selling',
        body: (
          <p>
            Sellers are responsible for the accuracy of their listings, pricing, and fulfilment of orders.
            Buyers agree to pay for items they order. URA facilitates transactions but is not a party to the
            contract of sale between a buyer and a seller.
          </p>
        ),
      },
      {
        heading: 'Payments and Escrow',
        body: (
          <p>
            Payments are processed through our payment partner, Payluk. When you use escrow, funds are held
            securely and released to the seller once the transaction is confirmed. Applicable fees are shown
            before you complete a payment.
          </p>
        ),
      },
      {
        heading: 'Prohibited Activity',
        body: (
          <p>
            You may not use URA to list illegal items, engage in fraud, harass other users, or infringe on
            intellectual property. We may suspend or remove accounts that violate these terms.
          </p>
        ),
      },
      {
        heading: 'Limitation of Liability',
        body: (
          <p>
            URA is provided on an "as is" basis. To the fullest extent permitted by law, we are not liable
            for indirect or consequential losses arising from your use of the platform.
          </p>
        ),
      },
      {
        heading: 'Changes to These Terms',
        body: (
          <p>
            We may update these terms from time to time. Continued use of URA after changes take effect means
            you accept the updated terms.
          </p>
        ),
      },
    ]}
  />
);

export default TermsOfService;
