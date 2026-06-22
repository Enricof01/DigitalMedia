import type { FormEvent } from "react";
import { GOALS } from "../../challenge/shared";
import type { AuthMode, LoginState } from "./types";

type AuthFormProps = {
  authMode: AuthMode;
  loginName: string;
  loginEmail: string;
  loginPassword: string;
  goal: string;
  loginState: LoginState;
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAuthModeChange: (mode: AuthMode) => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onGoalChange: (value: string) => void;
};

export default function AuthForm({
  authMode,
  loginName,
  loginEmail,
  loginPassword,
  goal,
  loginState,
  message,
  onSubmit,
  onAuthModeChange,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onGoalChange,
}: AuthFormProps) {
  return (
    <form className="challenge-form" onSubmit={onSubmit}>
      <header className="survey-form-head">
        <div>
          <span>{authMode === "login" ? "Einloggen" : "Neu erstellen"}</span>
          <h3>{authMode === "login" ? "Account Login" : "Challenge starten"}</h3>
        </div>
        <strong>7</strong>
      </header>

      <div className="auth-mode-switch" aria-label="Login Modus">
        <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => onAuthModeChange("login")}>
          Einloggen
        </button>
        <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => onAuthModeChange("register")}>
          Neu erstellen
        </button>
      </div>

      {authMode === "register" && (
        <label className="challenge-text-field">
          <span>Name</span>
          <input
            type="text"
            value={loginName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Dein Name"
            required
          />
        </label>
      )}

      <label className="challenge-text-field">
        <span>E-Mail</span>
        <input
          type="email"
          value={loginEmail}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="name@mail.de"
          required
        />
      </label>

      <label className="challenge-text-field">
        <span>Passwort</span>
        <input
          type="password"
          value={loginPassword}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Mindestens 6 Zeichen"
          minLength={6}
          required
        />
      </label>

      <p className="challenge-login-note">Dein Passwort wird nur als Hash in der Datenbank gespeichert.</p>

      <fieldset className="survey-group">
        <legend>Was willst du mit der Zeit machen?</legend>
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

      {loginState === "error" && <p className="survey-error">{message}</p>}

      <button className="survey-submit" type="submit" disabled={loginState === "loading"}>
        {loginState === "loading" ? "Prüft..." : authMode === "login" ? "Einloggen" : "Account erstellen"}
      </button>
    </form>
  );
}
