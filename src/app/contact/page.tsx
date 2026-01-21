import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <h1 className="text-3xl tracking-tight text-[var(--black)]">Contact</h1>
            <p className="mt-3 text-[var(--muted)] font-light">
              Get in touch with Protege Data Lab.
            </p>

            <div className="mt-14 space-y-10">
              {/* Email */}
              <div>
                <h2 className="text-xs font-mono uppercase tracking-wide text-[var(--muted)] mb-4">Email</h2>
                <a href="mailto:data@withprotege.ai" className="text-sm text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors">
                  data@withprotege.ai
                </a>
              </div>

              {/* Join Our Lab */}
              <div>
                <h2 className="text-xs font-mono uppercase tracking-wide text-[var(--muted)] mb-4">Join Our Lab</h2>
                <p className="text-sm text-[var(--muted)] font-light leading-relaxed">
                  We are always looking for talented and motivated researchers to join our team.{' '}
                  <a
                    href="https://jobs.ashbyhq.com/protege"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--pro-indigo)] hover:underline"
                  >
                    See here for current open positions
                  </a>
                  {' '}- you can also submit a &quot;build your own position&quot; on that link as well.
                </p>
              </div>
            </div>
          </div>

          {/* Visual element */}
          <div className="relative h-64 lg:h-80 overflow-hidden border border-[var(--cloud)] hidden lg:block">
            <Image
              src="/images/icons.png"
              alt="Network and operations icons"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
