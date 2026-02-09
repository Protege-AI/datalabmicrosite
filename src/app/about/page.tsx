import Link from 'next/link';

export const metadata = {
  title: 'About',
  description: 'We tackle the fundamental challenges in data for AI — building high-value datasets, leading data research, and partnering with foundation model teams.',
};

export default function AboutPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="text-3xl tracking-tight text-[var(--black)]">About the Data Lab</h1>
        <p className="mt-6 max-w-2xl text-lg text-[var(--muted)] font-light leading-relaxed">
          The Data Lab exists because truly useful data is rare—yet the frontier of AI development only moves forward when high-quality data makes it possible.
        </p>

        <div className="mt-10 pt-8 border-t border-[var(--cloud)] max-w-2xl space-y-6">
          <p className="text-[var(--muted)] font-light leading-relaxed">
            We understand the three core pillars driving AI: models, chips, and data. We are convinced that with the right datasets—the third, underdeveloped pillar—you can push the entire frontier forward. Imagine a task force explicitly focused on producing the next 100 or 1,000 ImageNet-grade datasets. Where would that take AI?
          </p>
        </div>

        {/* Our Goal */}
        <section className="mt-10">
          <h2 className="text-lg font-mono uppercase tracking-wide text-[var(--pro-indigo)] mb-6">Our Goal</h2>
          <p className="text-[var(--muted)] font-light leading-relaxed max-w-2xl">
            We aim to create the intellectual scaffolding that AI researchers look for when navigating ambiguity in data quality, data selection, medical complexity, and annotation strategy — including methodological advice, evaluation design, and guidance on safe and effective use of sensitive real-world data.
          </p>
        </section>

        {/* Our Approach */}
        <section className="mt-10">
          <h2 className="text-lg font-mono uppercase tracking-wide text-[var(--purple)] mb-6">Our Approach</h2>
          <div className="max-w-2xl space-y-6">
            <p className="text-[var(--muted)] font-light leading-relaxed">
              The Data Lab is deeply technical but grounded in reality. We think at the margin—always weighing the marginal value of a datapoint on learning and the opportunity cost of choosing the wrong dataset. We treat data decisions the way an applied researcher treats resource allocation: every cohort you build, every inclusion rule, every missing field has a cost. The question is always: what does this next datapoint buy us, and what do we lose if we chase the wrong thing?
            </p>
            <p className="text-[var(--muted)] font-light leading-relaxed">
              Our team of in-house experts constantly innovates to produce, repackage, and surface novel datasets from existing real-world data. We aim to be the single source of truth on using real-world data correctly to train and evaluate AI models.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="mt-10">
          <h2 className="text-lg font-mono uppercase tracking-wide text-[var(--orange)] mb-6">What We Do</h2>
          <div className="max-w-2xl space-y-8">
            <div>
              <h3 className="font-mono text-sm text-[var(--black)] mb-2">Scientific partnership for commercial opportunities.</h3>
              <p className="text-[var(--muted)] font-light leading-relaxed">
                We speak directly to foundation model researchers to navigate frontier-level technical discussions.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-sm text-[var(--black)] mb-2">Building high-value datasets and data products.</h3>
              <p className="text-[var(--muted)] font-light leading-relaxed">
                Deep methodological discipline, exposure to commercial data applications, and rigorous processes create new product opportunities stemming from the lab.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-sm text-[var(--black)] mb-2">Leading AI data research.</h3>
              <p className="text-[var(--muted)] font-light leading-relaxed">
                We maintain a presence within the broader academic community through publishing cutting-edge data research, designing evaluations and benchmarks, and identifying gaps in training and evaluation data today.
              </p>
            </div>
          </div>
        </section>

        {/* Read More */}
        <section className="mt-10">
          <p className="text-[var(--muted)] font-light leading-relaxed max-w-2xl">
            Read more on our{' '}
            <Link href="/blog" className="text-[var(--pro-indigo)] hover:underline">
              blog
            </Link>{' '}
            and our{' '}
            <Link href="/research" className="text-[var(--pro-indigo)] hover:underline">
              research page
            </Link>.
          </p>
        </section>

        {/* Join Us */}
        <section className="mt-10 pt-6 border-t border-[var(--cloud)]">
          <h2 className="text-lg font-mono uppercase tracking-wide text-[var(--muted)] mb-4">Join Us</h2>
          <p className="text-[var(--muted)] font-light leading-relaxed max-w-2xl">
            Interested in our mission? Learn about{' '}
            <Link href="/people" className="text-[var(--pro-indigo)] hover:underline">
              our people
            </Link>{' '}
            or visit our{' '}
            <Link href="/contact" className="text-[var(--pro-indigo)] hover:underline">
              contact page
            </Link>{' '}
            to get in touch.
          </p>
        </section>
      </div>
    </div>
  );
}
