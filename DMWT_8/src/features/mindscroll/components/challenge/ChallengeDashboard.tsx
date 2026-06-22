import {
  DAY_COUNT,
  formatMinutes,
  type ChallengeEntry,
  type ChallengeUser,
} from "../../challenge/shared";
import type { ReportState } from "./types";

type ChallengeDashboardProps = {
  user: ChallengeUser | null;
  entriesByDay: Map<number, ChallengeEntry>;
  entriesCount: number;
  savedMinutes: number;
  averageMinutes: number;
  improvementPercent: number;
  targetMinutes: number;
  chartMax: number;
  rewardText: string;
  tipText: string;
  reportState: ReportState;
  reportMessage: string;
  onSendWeeklyReport: () => void;
};

export default function ChallengeDashboard({
  user,
  entriesByDay,
  entriesCount,
  savedMinutes,
  averageMinutes,
  improvementPercent,
  targetMinutes,
  chartMax,
  rewardText,
  tipText,
  reportState,
  reportMessage,
  onSendWeeklyReport,
}: ChallengeDashboardProps) {
  return (
    <aside className="challenge-dashboard" aria-label="Personalisierte Challenge Grafik">
      <div className="dashboard-head">
        <span>Deine Grafik</span>
        <strong>{savedMinutes > 0 ? formatMinutes(savedMinutes) : "0 Min"}</strong>
        <small>gegenüber Tag 1 gespart</small>
      </div>

      <div className="challenge-chart">
        {Array.from({ length: DAY_COUNT }, (_, index) => {
          const day = index + 1;
          const entry = entriesByDay.get(day);
          const height = entry ? Math.max(8, Math.round((entry.screenMinutes / chartMax) * 100)) : 8;
          const isLower = entry ? entry.screenMinutes <= targetMinutes : false;

          return (
            <div className="chart-day" key={day}>
              <div className="chart-track">
                <span
                  className={entry ? (isLower ? "is-good" : "is-high") : ""}
                  style={{ height: `${height}%` }}
                />
              </div>
              <small>{day}</small>
            </div>
          );
        })}
      </div>

      <div className="challenge-stats">
        <div>
          <strong>{averageMinutes ? formatMinutes(averageMinutes) : "--"}</strong>
          <span>Durchschnitt</span>
        </div>
        <div>
          <strong>{improvementPercent}%</strong>
          <span>weniger als Tag 1</span>
        </div>
      </div>

      <div className="challenge-reward">
        <span>Anreiz</span>
        <p>{rewardText}</p>
      </div>

      <div className="challenge-tip">
        <span>Nächster Schritt</span>
        <p>{tipText}</p>
      </div>

      <div className="challenge-email-report">
        <span>Wochenbericht</span>
        <p>
          Schicke dir deine gespeicherten Tage, Kennzahlen und Interpretation automatisch als E-Mail.
          {user ? ` Der Bericht geht an ${user.email}.` : ""}
        </p>
        <button type="button" onClick={onSendWeeklyReport} disabled={!user || entriesCount === 0 || reportState === "sending"}>
          {reportState === "sending" ? "Sendet..." : "Bericht per E-Mail"}
        </button>
        {reportMessage && <small className={reportState === "error" ? "is-error" : ""}>{reportMessage}</small>}
      </div>
    </aside>
  );
}
