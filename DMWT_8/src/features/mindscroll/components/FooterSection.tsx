import CreatedBy from "@/components/CreatedBy";

export default function FooterSection() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-inner">
        <div className="footer-logo">scrollfrei.</div>
        <div className="footer-text">
          Diese Seite hat keine App. Kein Like-Button. Kein Algorithmus.
          <br />
          Nur eine Frage: Was machst du mit deiner Zeit?
        </div>
        <CreatedBy />
      </div>
    </footer>
  );
}
