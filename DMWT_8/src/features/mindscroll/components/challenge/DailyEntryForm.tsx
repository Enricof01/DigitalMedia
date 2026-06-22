import type { FormEvent } from "react";
import {
  DAY_COUNT,
  GOALS,
  formatMinutes,
  type ChallengeEntry,
  type ChallengeUser,
} from "../../challenge/shared";
import type { SaveState } from "./types";

type DailyEntryFormProps = {
  user: ChallengeUser;
  activeDay: number;
  entriesByDay: Map<number, ChallengeEntry>;
  progressText: string;
  screenMinutes: number;
  targetMinutes: number;
  goal: string;
  note: string;
  saveState: SaveState;
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
  onDaySelect: (day: number) => void;
  onScreenMinutesChange: (value: number) => void;
  onTargetMinutesChange: (value: number) => void;
  onGoalChange: (value: string) => void;
  onNoteChange: (value: string) => void;
};

export default function DailyEntryForm({
  user,
  activeDay,
  entriesByDay,
  progressText,
  screenMinutes,
  targetMinutes,
  goal,
  note,
  saveState,
  message,
  onSubmit,
  onLogout,
  onDaySelect,
  onScreenMinutesChange,
  onTargetMinutesChange,
  onGoalChange,
  onNoteChange,
}: DailyEntryFormProps) {
  return (
    <form className="challenge-form" onSubmit={onSubmit}>
      <header className="survey-form-head">
        <div>
          <span>{user.name}</span>
          <h3>Tag {activeDay}</h3>
        </div>
        <div className="challenge-session-actions">
          <strong>{progressText}</strong>
          <button type="button" onClick={onLogout}>Abmelden</button>
        </div>
      </header>

      <div className="challenge-days" aria-label="Challenge Tage">
        {Array.from({ length: DAY_COUNT }, (_, index) => {
          const day = index + 1;
          const done = entriesByDay.has(day);

          return (
            <button
              key={day}
              type="button"
              className={`${activeDay === day ? "active" : ""}${done ? " done" : ""}`}
              onClick={() => onDaySelect(day)}
            >
              {day}
            </button>
          );
        })}
      </div>

      <label className="survey-field">
        <span>
          Bildschirmzeit heute <strong>{formatMinutes(screenMinutes)}</strong>
        </span>
        <input
          type="range"
          min="0"
          max="960"
          step="15"
          value={screenMinutes}
          onChange={(event) => onScreenMinutesChange(Number(event.target.value))}
        />
      </label>

      <label className="survey-field">
        <span>
          Tagesziel <strong>{formatMinutes(targetMinutes)}</strong>
        </span>
        <input
          type="range"
          min="15"
          max="720"
          step="15"
          value={targetMinutes}
          onChange={(event) => onTargetMinutesChange(Number(event.target.value))}
        />
      </label>

      <fieldset className="survey-group">
        <legend>Wunsch für die freie Zeit</legend>
        <div className="survey-options two">
          {GOALS.map((item) => (
            <button
              key={item}
              type="button"
              className={goal === item ? "active" : ""}
              onClick={() => onGoalChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="challenge-note">
        <span>Kurznotiz</span>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Was hat heute geholfen?"
          rows={2}
        />
      </label>

      {message && <p className={saveState === "error" ? "survey-error" : "survey-success"}>{message}</p>}

      <button className="survey-submit" type="submit" disabled={saveState === "saving"}>
        {saveState === "saving" ? "Speichert..." : `Tag ${activeDay} speichern`}
      </button>
    </form>
  );
}
