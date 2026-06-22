export default function PageNav() {
  return (
    <details className="page-nav">
      <summary aria-label="Navigation öffnen">
        <span />
        <span />
        <span />
      </summary>
      <nav aria-label="Seitennavigation">
        <a href="#top">Start</a>
        <a href="#recall">Stopp</a>
        <a href="#impact">Infografik</a>
        <a href="#survey">Login</a>
      </nav>
    </details>
  );
}
