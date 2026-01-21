export default function AboutPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="text-3xl tracking-tight text-neutral-900">About</h1>
        <p className="mt-3 text-neutral-500 font-light">
          Protege Data Lab
        </p>

        <div className="mt-14 space-y-8 max-w-2xl">
          <p className="text-neutral-600 font-light leading-relaxed">
            Protege Data Lab is a research group focused on advancing the field of data science
            and machine learning. We develop novel methods, tools, and infrastructure for
            working with data at scale.
          </p>

          <p className="text-neutral-600 font-light leading-relaxed">
            Our research spans multiple areas including data infrastructure, machine learning
            systems, data quality, and applied AI. We collaborate with industry partners and
            publish our work at top venues.
          </p>

          <p className="text-neutral-600 font-light leading-relaxed">
            We are committed to training the next generation of data scientists and researchers
            through hands-on research experience and mentorship.
          </p>
        </div>

        <div className="mt-14 pt-8 border-t border-neutral-200">
          <p className="font-mono text-xs text-neutral-400">
            // More details coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
