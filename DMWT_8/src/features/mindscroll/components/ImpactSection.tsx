import type { Dispatch, PointerEvent, SetStateAction, CSSProperties } from "react";

type PotentialItem = {
  label: string;
  value: number;
  unit: string;
  max: number;
};

type ImpactSectionProps = {
  hours: number;
  yr: number;
  lostDaysDisplay: string;
  clockAngle: number;
  yearCells: boolean[];
  potential: PotentialItem[];
  onClockPointer: (event: PointerEvent<HTMLDivElement>) => void;
  onHoursChange: Dispatch<SetStateAction<number>>;
};

export default function ImpactSection({
  hours,
  yr,
  lostDaysDisplay,
  clockAngle,
  yearCells,
  potential,
  onClockPointer,
  onHoursChange,
}: ImpactSectionProps) {
  return (
    <section className="challenge" id="impact">
      <div className="ch-inner">
        <div className="challenge-copy">
          <div className="ch-eyebrow">Bereit?</div>
          <h2 className="ch-title">Hol dir heute<br /><span className="ch-accent">60 Minuten</span><br />zurück.</h2>
          <p className="ch-body">Leg das Handy weg. Nicht für immer. Aber heute, für eine Stunde. Schau wie weit du kommst.</p>
          <div
            className="time-dial"
            role="slider"
            aria-label="Social-Media-Zeit pro Tag über Uhr einstellen"
            aria-valuemin={0.5}
            aria-valuemax={12}
            aria-valuenow={hours}
            aria-valuetext={`${hours.toLocaleString("de-DE")} Stunden pro Tag`}
            tabIndex={0}
            style={{ "--clock-angle": `${clockAngle}deg` } as CSSProperties}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              onClockPointer(event);
            }}
            onPointerMove={(event) => {
              if (event.buttons === 1) onClockPointer(event);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                onHoursChange((value) => Math.min(12, value + 0.5));
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                onHoursChange((value) => Math.max(0.5, value - 0.5));
              }
            }}
          >
            <div className="dial-face">
              {Array.from({ length: 12 }, (_, index) => (
                <span
                  key={index}
                  className="dial-tick"
                  style={{ transform: `rotate(${index * 30}deg)` }}
                >
                  <i style={{ transform: `translateX(-50%) rotate(${-index * 30}deg)` }}>{index === 0 ? 12 : index}</i>
                </span>
              ))}
              <div className="dial-track" />
              <div className="dial-hand" style={{ transform: `rotate(${clockAngle}deg)` }}>
                <span />
              </div>
              <div className="dial-center">
                <strong>{hours.toLocaleString("de-DE")}h</strong>
                <small>pro Tag</small>
              </div>
            </div>
            <div className="dial-hint">Zeiger aufziehen</div>
          </div>
        </div>

        <aside className="impact-graphic" aria-label="Interaktive Infografik zum Zeitverlust">
          <div className="impact-top">
            <div>
              <span className="impact-kicker">Infografik</span>
              <h3>Dein verlorenes Jahr</h3>
            </div>
            <strong>{lostDaysDisplay}<small>Tage</small></strong>
          </div>
          <div className="impact-slider" aria-live="polite">
            <span><b>{hours.toLocaleString("de-DE")}h</b> Social Media pro Tag</span>
            <em>Stelle die Zeit links an der Uhr ein</em>
          </div>
          <div className="impact-math">
            <div><strong>{yr.toLocaleString("de-DE")}</strong><span>Stunden pro Jahr</span></div>
            <div><strong>{lostDaysDisplay}</strong><span>24h-Tage weg</span></div>
          </div>
          <div className="year-map" aria-label={`${lostDaysDisplay} von 365 Jahrestagen markiert`}>
            {yearCells.map((isActive, index) => (
              <span key={index} className={isActive ? "active" : ""} />
            ))}
          </div>
          <p className="impact-caption">
            Jede helle Kachel steht für einen 24-Stunden-Tag, der im Feed verschwinden kann.
          </p>
          <div className="impact-options">
            <div className="impact-option-head">Was daraus werden könnte</div>
            {potential.map((item) => (
              <div className="impact-option" key={item.label}>
                <div>
                  <strong>{item.value.toLocaleString("de-DE")}</strong>
                  <span>{item.label} {item.unit}</span>
                </div>
                <i style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }} />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
