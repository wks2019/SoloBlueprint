import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Terms = () => {
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
        <h1 className="font-display text-3xl text-foreground mb-2">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: June 2026 · Governing law: England & Wales</p>

        {/* Plain English Summary */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Plain English Summary</p>
          <p className="text-sm text-muted-foreground mb-4">We know nobody reads T&Cs. So here's what actually matters:</p>
          <div className="space-y-3">
            {[
              { icon: "🤖", title: "AI is not a professional", desc: "SoloBlueprint gives you AI-generated ideas and plans. It is not a business consultant, lawyer, or financial adviser. Always check with a real professional before spending money or making big decisions." },
              { icon: "🪙", title: "Tokens don't expire", desc: "Once you buy tokens, they're yours forever. Monthly subscription tokens roll over unused. We won't take them back." },
              { icon: "🚫", title: "Illegal ideas get refused", desc: "We won't generate blueprints for illegal businesses, scams, or anything designed to harm people. The AI filters these automatically." },
              { icon: "🔒", title: "Your data stays in Europe", desc: "Your data is stored on AWS servers in London (eu-west-2). We don't sell your data. We don't use it for ads. Your blueprint inputs are processed by Anthropic's Claude API but not used to train AI models (API accounts are exempt)." },
              { icon: "💳", title: "Cancellations are clean", desc: "Cancel any time via your account menu. You keep access and tokens until the end of your billing period. No awkward phone calls." },
              { icon: "📋", title: "You own your blueprints", desc: "Every blueprint you generate belongs to you. Use it however you like — share it, pitch it, build from it." },
              { icon: "⚖️", title: "UK law applies", desc: "This is a UK product governed by English law. If something goes wrong, English courts handle it." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-5 pt-4 border-t border-primary/10">
            The full legal terms follow below. They say the same things in more detail.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">1. About SoloBlueprint</h2>
            <p>SoloBlueprint ("we", "us", "our") is an AI-powered business planning tool operated by SoloBlueprint, based in the United Kingdom. By accessing or using SoloBlueprint at soloblueprint.co.uk ("the Service"), you agree to be bound by these Terms & Conditions.</p>
            <p className="mt-2">If you do not agree with any part of these terms, you must not use the Service.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">2. The Service</h2>
            <p>SoloBlueprint provides AI-generated business blueprint documents based on information you provide. The Service uses Claude AI (Anthropic) to generate structured business plans, market analysis, pricing strategies, and launch plans tailored to your inputs.</p>
            <p className="mt-2">We reserve the right to modify, suspend, or discontinue the Service at any time without notice.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">3. Disclaimer — AI Outputs Are Not Professional Advice</h2>
            <div className="rounded-xl border border-border bg-card p-5 text-foreground">
              <p className="font-semibold mb-2">⚠️ Important — please read carefully</p>
              <p>All content generated by SoloBlueprint is for <strong>general informational and educational purposes only</strong>. It does not constitute and must not be relied upon as:</p>
              <ul className="mt-3 space-y-1.5 list-disc list-inside">
                <li>Professional business advice</li>
                <li>Legal advice or guidance</li>
                <li>Financial or investment advice</li>
                <li>Accounting or tax advice</li>
                <li>Marketing or regulatory compliance guidance</li>
              </ul>
              <p className="mt-3">Always consult qualified professionals — including solicitors, accountants, financial advisers, and business consultants — before making any business decisions based on AI-generated content.</p>
              <p className="mt-3">SoloBlueprint makes no warranties, express or implied, regarding the accuracy, completeness, reliability, or suitability of any generated content for any particular purpose.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">4. Acceptable Use & Content Policy</h2>
            <p>By using the Service, you agree to only request blueprints for lawful, ethical business purposes. SoloBlueprint operates under Anthropic's usage policies and our own content standards.</p>

            <p className="mt-3 font-medium text-foreground">The following are strictly prohibited:</p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside">
              <li>Illegal businesses, activities, or services in any jurisdiction</li>
              <li>Businesses designed to deceive, defraud, or exploit consumers</li>
              <li>Multi-level marketing (MLM) or pyramid scheme structures</li>
              <li>Businesses involving controlled substances, weapons, or counterfeit goods</li>
              <li>Services that facilitate harassment, discrimination, or harm to individuals or groups</li>
              <li>Content that infringes third-party intellectual property rights</li>
              <li>Businesses that violate UK, EU, or applicable local regulations</li>
              <li>Any use intended to circumvent laws, regulations, or platform policies</li>
            </ul>

            <p className="mt-3">SoloBlueprint reserves the right to refuse blueprint generation for any request that, in our sole judgement, violates these terms or our content policies. No refund will be issued for refused requests where a violation of these terms has occurred.</p>
            <p className="mt-3">AI outputs are filtered through Anthropic's content policies. Certain requests may be declined at the AI level regardless of our own review.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">5. Tokens & Payments</h2>
            <p>SoloBlueprint uses a token-based system. Each blueprint generation costs one (1) token. Tokens are non-refundable once used.</p>
            <p className="mt-2">New accounts receive one (1) free token upon registration. Additional tokens may be purchased via Stripe.</p>
            <p className="mt-2">Purchased tokens do not expire. Monthly subscription tokens are credited at the start of each billing period and roll over unused.</p>
            <p className="mt-2">All prices are in GBP (£) and inclusive of applicable VAT where required.</p>
            <p className="mt-2">We reserve the right to change token pricing at any time. Existing purchased tokens are not affected by price changes.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">6. Subscriptions & Cancellations</h2>
            <p>Monthly subscriptions renew automatically until cancelled. You may cancel at any time via your account menu. Cancellation takes effect at the end of the current billing period — you retain access and token credits until then.</p>
            <p className="mt-2">Under UK Consumer Contracts Regulations, you have a 14-day cooling-off period from the date of purchase for digital services, unless you have already begun using the service (i.e. generated a blueprint), at which point the right to cancel without charge may be waived.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">7. Intellectual Property</h2>
            <p>The blueprints generated by SoloBlueprint are provided for your personal or commercial use. You own the outputs generated from your inputs.</p>
            <p className="mt-2">The SoloBlueprint platform, brand, code, design, and all underlying technology remain the exclusive property of SoloBlueprint. You may not copy, reproduce, or redistribute any part of the platform itself.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">8. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, SoloBlueprint shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service or reliance on any generated content.</p>
            <p className="mt-2">Our total liability to you for any claim arising from use of the Service shall not exceed the amount you paid us in the 30 days preceding the claim.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">9. Privacy</h2>
            <p>Your use of the Service is also governed by our <button onClick={() => navigate("/privacy")} className="text-primary underline hover:no-underline">Privacy Policy</button>. By using SoloBlueprint, you consent to the collection and use of your data as described therein.</p>
            <p className="mt-2">We store your generated blueprints in our database to enable the blueprint history feature. You may request deletion of your data by contacting us.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">10. Governing Law</h2>
            <p>These Terms & Conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">11. Changes to These Terms</h2>
            <p>We may update these Terms & Conditions from time to time. We will notify you of significant changes by posting a notice on the Service. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">12. Contact</h2>
            <p>For any questions regarding these Terms & Conditions, please contact us at:</p>
            <p className="mt-2"><a href="mailto:support@soloblueprint.co.uk" className="text-primary hover:underline">support@soloblueprint.co.uk</a></p>
          </section>

        </div>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        © 2026 SoloBlueprint · <button onClick={() => navigate("/privacy")} className="hover:text-foreground">Privacy Policy</button>
      </footer>
    </div>
  );
};

export default Terms;
