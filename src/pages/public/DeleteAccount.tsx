import LegalPage from './LegalPage';

const SUPPORT_EMAIL = 'info@ura.com.ng';
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Delete my URA account')}`;

// Public page linked from the Google Play listing (account deletion requirement).
// Keep in step with the mobile app's Settings → Delete account screen.
const DeleteAccount = () => (
  <LegalPage
    title="Delete Your Account"
    updated="November 2026"
    intro="You can ask us to delete your URA account and the data linked to it at any time. This page explains how, and what happens to your data."
    sections={[
      {
        heading: 'How to Request Deletion',
        body: (
          <>
            <p>
              <strong>In the URA app:</strong> open More → Settings → Delete account, then tap the button to send
              your request.
            </p>
            <p>
              <strong>By email:</strong> send an email to{' '}
              <a href={MAILTO} className="font-semibold text-amber-600 underline">
                {SUPPORT_EMAIL}
              </a>{' '}
              with the subject “Delete my URA account”, from the email address you use to sign in to URA.
            </p>
          </>
        ),
      },
      {
        heading: 'What We Delete',
        body: (
          <p>
            Your profile, posts, products, shop page, followers, bookmarks and chats are removed from URA. This can’t
            be undone.
          </p>
        ),
      },
      {
        heading: 'What We Keep',
        body: (
          <p>
            Order and payment records that the law requires us to keep are kept for that period only, and are then
            deleted.
          </p>
        ),
      },
      {
        heading: 'Before You Delete',
        body: (
          <p>
            Withdraw any money in your wallet, and finish or cancel any open orders. We can’t delete an account while
            an order or payment is still in progress.
          </p>
        ),
      },
      {
        heading: 'How Long It Takes',
        body: (
          <p>
            We confirm your request by email and delete the account within 30 days.
          </p>
        ),
      },
    ]}
  />
);

export default DeleteAccount;
