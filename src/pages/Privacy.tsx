import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo size="sm" />
          <button onClick={() => navigate(-1)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground">
            ← Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Legal</p>
        <h1 className="font-display text-3xl text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: June 2026 · Governing law: England & Wales</p>

        <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">1. Who We Are</h2>
            <p>SoloBlueprint ("we", "us", "our") operates soloblueprint.co.uk. We are committed to protecting your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>
            <p className="mt-2">Contact: <a href="mailto:support@soloblueprint.co.uk" className="text-primary hover:underline">support@soloblueprint.co.uk</a></p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">2. Data We Collect</h2>
            <p className="font-medium text-foreground">Account data:</p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Email address (required for account creation)</li>
              <li>Encrypted password (stored via Supabase Auth — we never see it in plain text)</li>
            </ul>
            <p className="mt-3 font-medium text-foreground">Usage data:</p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Blueprint inputs (your business idea, budget, hours, experience, goal)</li>
              <li>Generated blueprint content</li>
              <li>Token balance and transaction history</li>
              <li>Timestamps of activity</li>
            </ul>
            <p className="mt-3 font-medium text-foreground">Payment data:</p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Payment processing is handled entirely by Stripe — we do not store card details</li>
              <li>We store your Stripe customer ID and subscription status</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">3. How We Use Your Data</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>To provide and improve the Service</li>
              <li>To authenticate your account and maintain security</li>
              <li>To process payments and manage token balances</li>
              <li>To store and display your blueprint history</li>
              <li>To send transactional emails (account confirmation, password reset)</li>
              <li>To analyse usage patterns and improve the product</li>
            </ul>
            <p className="mt-3">We do not sell your personal data to third parties. We do not use your data for advertising.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">4. AI Processing</h2>
            <p>Your blueprint inputs are sent to Anthropic's Claude API for processing. By using SoloBlueprint, you consent to your inputs being processed by Anthropic in accordance with <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Anthropic's Privacy Policy</a>.</p>
            <p className="mt-2">Do not include sensitive personal information (NHS numbers, passport details, bank account numbers, etc.) in your blueprint inputs.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">5. Data Storage</h2>
            <p>Your data is stored on Supabase infrastructure hosted on AWS (eu-west-2, London region). All data is encrypted at rest and in transit.</p>
            <p className="mt-2">Payment data is processed and stored by Stripe, Inc. in accordance with PCI DSS standards.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">6. Your Rights (UK GDPR)</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside">
              <li><strong className="text-foreground">Access</strong> — request a copy of your personal data</li>
              <li><strong className="text-foreground">Rectification</strong> — correct inaccurate data</li>
              <li><strong className="text-foreground">Erasure</strong> — request deletion of your account and data</li>
              <li><strong className="text-foreground">Portability</strong> — receive your data in a portable format</li>
              <li><strong className="text-foreground">Restriction</strong> — restrict how we process your data</li>
              <li><strong className="text-foreground">Object</strong> — object to processing based on legitimate interests</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email <a href="mailto:support@soloblueprint.co.uk" className="text-primary hover:underline">support@soloblueprint.co.uk</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">7. Cookies</h2>
            <p>SoloBlueprint uses minimal cookies — only those necessary for authentication (Supabase session token). We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">8. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. Generated blueprints are stored indefinitely to power your history feature. Upon account deletion, all personal data is removed within 30 days.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">9. Third-Party Services</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li><strong className="text-foreground">Supabase</strong> — database and authentication</li>
              <li><strong className="text-foreground">Anthropic (Claude API)</strong> — AI generation</li>
              <li><strong className="text-foreground">Stripe</strong> — payment processing</li>
              <li><strong className="text-foreground">Netlify</strong> — hosting and deployment</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the Service.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">11. Complaints</h2>
            <p>If you have concerns about how we handle your data, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a>.</p>
          </section>

        </div>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        © 2026 SoloBlueprint · <button onClick={() => navigate("/terms")} className="hover:text-foreground">Terms & Conditions</button>
      </footer>
    </div>
  );
};

export default Privacy;
