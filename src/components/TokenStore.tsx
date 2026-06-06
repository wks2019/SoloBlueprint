import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PACKS = [
  { id: "starter", tokens: 3, price: "£9", per: "£3/token", desc: "Try a few ideas", popular: false },
  { id: "builder", tokens: 10, price: "£19", per: "£1.90/token", desc: "Validate seriously", popular: true },
  { id: "pro", tokens: 30, price: "£39", per: "£1.30/token", desc: "Full research mode", popular: false },
  { id: "monthly", tokens: 20, price: "£19/mo", per: "Rollover unused", desc: "Best for regulars", popular: false },
];

interface TokenStoreProps {
  onClose?: () => void;
  inline?: boolean;
}

export const TokenStore = ({ onClose, inline = false }: TokenStoreProps) => {
  const [selected, setSelected] = useState("builder");
  const navigate = useNavigate();

  const content = (
    <div className={inline ? "" : "p-6 sm:p-8"}>
      <div className="mb-1 text-2xl text-center">🪙</div>
      <h2 className="font-display text-2xl text-center text-foreground mb-1">Get more tokens</h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Each token generates one complete 14-section blueprint.
      </p>

      <div className="space-y-2.5 mb-5">
        {PACKS.map((pack) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => setSelected(pack.id)}
            className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
              selected === pack.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {pack.id === "monthly" ? "20 tokens/mo" : `${pack.tokens} tokens`}
                </span>
                {pack.popular && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">Best value</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{pack.desc} · {pack.per}</p>
            </div>
            <div className="text-right">
              <span className="font-display text-lg text-foreground">{pack.price}</span>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate("/app/checkout?pack=" + selected)}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] transition hover:brightness-110"
      >
        Continue to payment →
      </button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Secure payment via Stripe · Tokens never expire
      </p>
      {onClose && (
        <button onClick={onClose} className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground">
          Maybe later
        </button>
      )}
    </div>
  );

  if (inline) return <div className="rounded-2xl border border-border bg-background">{content}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-2xl">
        {content}
      </div>
    </div>
  );
};
