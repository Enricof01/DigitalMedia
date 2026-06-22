type BrandLockupProps = {
  showTagline: boolean;
};

export default function BrandLockup({ showTagline }: BrandLockupProps) {
  return (
    <div className="brand-lockup">
      <a className="brand-logo" href="/test" aria-label="Mindscroll">
        <span className="brand-badge">
          <span className="brand-phone" />
        </span>
        <span className="brand-word" data-text="MINDSCROLL">
          <span>MINDSCROLL</span>
          <span>SCROLLFREI</span>
        </span>
      </a>
      <div className={`brand-tagline${showTagline ? "" : " is-hidden"}`}>
        Kampagne gegen Zeitverschwendung
      </div>
    </div>
  );
}
