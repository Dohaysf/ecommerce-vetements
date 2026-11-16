"use client";

const CSS = `
/* Calque d'ouverture : visible uniquement quand l'intro est active */
.rv-intro { position: fixed; inset: 0; z-index: 100; display: none; animation: rv-intro-exit 0.01s linear 2.8s forwards; }
html[data-intro="pending"] .rv-intro,
html[data-intro="opening"] .rv-intro { display: block; }
@keyframes rv-intro-exit { to { visibility: hidden; } }

/* Les deux rideaux */
.rv-intro-panel { position: absolute; top: 0; bottom: 0; width: 50.3%; background: #3E1521; }
.rv-intro-left { left: 0; border-right: 1px solid rgba(184,151,90,.45); animation: rv-panel-left .85s cubic-bezier(.76,0,.24,1) 1.9s forwards; }
.rv-intro-right { right: 0; border-left: 1px solid rgba(184,151,90,.45); animation: rv-panel-right .85s cubic-bezier(.76,0,.24,1) 1.9s forwards; }
@keyframes rv-panel-left { to { transform: translateX(-100%); } }
@keyframes rv-panel-right { to { transform: translateX(100%); } }

/* Contenu central */
.rv-intro-center { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; animation: rv-intro-out .4s ease 1.85s forwards; }
@keyframes rv-intro-out { to { opacity: 0; transform: translateY(-12px); } }

.rv-intro-arch { stroke-dasharray: 1; stroke-dashoffset: 1; animation: rv-intro-draw 1.5s cubic-bezier(.45,.05,.25,1) .2s forwards; }
.rv-intro-arch-2 { animation-delay: .5s; }
@keyframes rv-intro-draw { to { stroke-dashoffset: 0; } }

.rv-intro-seal { opacity: 0; animation: rv-stamp .5s cubic-bezier(.2,1.35,.4,1) .6s forwards; }
@keyframes rv-stamp { from { opacity: 0; transform: scale(1.8) rotate(-16deg); } to { opacity: 1; transform: scale(1) rotate(-6deg); } }

.rv-intro-ring { opacity: 0; animation: rv-ring 1s ease-out 1s forwards; }
@keyframes rv-ring { 0% { opacity: .55; transform: scale(1); } 100% { opacity: 0; transform: scale(1.9); } }

.rv-intro-brand { opacity: 0; animation: rv-rise .8s ease 1.05s forwards; }
.rv-intro-tag { opacity: 0; animation: rv-rise .8s ease 1.3s forwards; }
.rv-intro-skip { opacity: 0; animation: rv-rise .6s ease .8s forwards; }
@keyframes rv-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* Les animations du hero attendent l'ouverture des rideaux */
html[data-intro="pending"] .rv-line,
html[data-intro="pending"] .rv-draw,
html[data-intro="pending"] .rv-leaf { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .rv-intro { display: none !important; }
}
`;

function sealPath(r = 46, bumps = 22, amp = 2.2, steps = 240) {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const rr = r + amp * Math.sin(bumps * t);
    pts.push(
      `${(50 + rr * Math.cos(t)).toFixed(2)} ${(50 + rr * Math.sin(t)).toFixed(2)}`
    );
  }
  return `M${pts.join(" L")} Z`;
}
const SEAL_PATH = sealPath();

export default function WelcomeIntro() {
  const skip = () =>
    document.documentElement.setAttribute("data-intro", "done");

  return (
    <>
      <style>{CSS}</style>

      <div className="rv-intro">
        <div className="rv-intro-panel rv-intro-left" aria-hidden="true" />
        <div className="rv-intro-panel rv-intro-right" aria-hidden="true" />

        <div className="rv-intro-center">
          <div
            aria-hidden="true"
            className="relative w-[min(56vw,13rem)]"
          >
            <svg viewBox="0 0 200 280" className="block w-full" fill="none">
              <path
                className="rv-intro-arch"
                pathLength={1}
                d="M12 272 L12 100 A88 88 0 0 1 188 100 L188 272 Z"
                stroke="#B8975A"
                strokeWidth="1.2"
              />
              <path
                className="rv-intro-arch rv-intro-arch-2"
                pathLength={1}
                d="M26 272 L26 102 A74 74 0 0 1 174 102 L174 272 Z"
                stroke="#B8975A"
                strokeOpacity="0.5"
                strokeWidth="0.8"
              />
            </svg>

            <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2">
              <span className="rv-intro-ring absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#B8975A]" />
              <div className="rv-intro-seal">
                <svg viewBox="0 0 100 100" className="h-24 w-24">
                  <path d={SEAL_PATH} fill="#5A1E2E" />
                  <path
                    d={SEAL_PATH}
                    fill="none"
                    stroke="#2A0E16"
                    strokeOpacity="0.4"
                    strokeWidth="1"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke="#D8BE82"
                    strokeWidth="1.4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="32.5"
                    fill="none"
                    stroke="#D8BE82"
                    strokeOpacity="0.55"
                    strokeWidth="0.6"
                  />
                  <text
                    x="50"
                    y="59"
                    textAnchor="middle"
                    fontSize="27"
                    fill="#E8D5A6"
                    style={{
                      fontFamily: "var(--font-display), Georgia, serif",
                      fontStyle: "italic",
                    }}
                  >
                    D&amp;É
                  </text>
                </svg>
              </div>
            </div>
          </div>

          <p
            aria-hidden="true"
            className="rv-intro-brand mt-9 font-[family-name:var(--font-display)] text-[2.1rem] italic leading-none text-[#F1E7D6]"
          >
            Douceur &amp; Élégance
          </p>
          <p
            aria-hidden="true"
            className="rv-intro-tag mt-3 text-[11px] uppercase tracking-[0.4em] text-[#D8BE82]"
          >
            Prêt-à-porter
          </p>

          <button
            type="button"
            onClick={skip}
            className="rv-intro-skip absolute bottom-8 left-1/2 -translate-x-1/2 border-b border-[#D8BE82]/40 pb-0.5 text-[12px] uppercase tracking-[0.25em] text-[#D8BE82]/80 transition hover:text-[#D8BE82]"
          >
            Passer
          </button>
        </div>
      </div>
    </>
  );
}