
import LoginButton from "@/components/LoginButton";

export default function LandingPage() {
  return (
    <div className="app-container">
      <div className="main-card-wrapper">
        <img
          src="https://cdn.auth0.com/website/auth0-logo-dark.svg"
          alt="Auth0 Logo"
          className="auth0-logo"
        />
        <h1 className="main-title">Next.js + Auth0</h1>

        <div className="action-card">
          <p className="action-text">
            Welcome! Please log in to access your protected content.
          </p>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
