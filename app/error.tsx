"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container section">
      <h1>We couldn’t load this page.</h1>
      <p>The research database may be unavailable. Please try again.</p>
      <button className="primary-button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
