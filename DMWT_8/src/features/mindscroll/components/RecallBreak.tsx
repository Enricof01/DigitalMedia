import { POSTS, SCROLLED_POSTS } from "../data/content";

type RecallBreakProps = {
  timeAccountValue: string;
  timeAccountHint: string;
};

export default function RecallBreak({ timeAccountValue, timeAccountHint }: RecallBreakProps) {
  return (
    <section className="recall-break" id="recall">
      <div className="recall-inner">
        <div className="recall-strip" aria-hidden="true">
          {POSTS.slice(0, 6).map((post) => (
            <span key={post.user} style={{ backgroundImage: `url(${post.photo})` }} />
          ))}
        </div>
        <div className="recall-kicker">Stopp</div>
        <h2>Du hast gerade {SCROLLED_POSTS} Posts gesehen. Erinnerst du dich an 3?</h2>
        <p>
          Genau hier passiert der Bruch: Der Feed war laut, schnell und passend.
          Aber was davon ist wirklich bei dir geblieben?
        </p>
        <div className="recall-grid">
          <div><strong>{SCROLLED_POSTS}</strong><span>Posts gesehen</span></div>
          <div><strong>3?</strong><span>bewusst erinnert</span></div>
          <div><strong>{timeAccountValue}</strong><span>{timeAccountHint}</span></div>
        </div>
      </div>
    </section>
  );
}
