import { getPeople, Person } from '@/lib/notion';

export const revalidate = 60;

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function WebsiteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function PersonCard({ person }: { person: Person }) {
  const hasSocialLinks = person.linkedin || person.twitter || person.website;

  return (
    <div className="border border-[var(--cloud)] p-5 hover:border-[var(--pro-indigo)]/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 bg-[var(--powder)]/30 flex items-center justify-center shrink-0 font-mono text-xs text-[var(--pro-indigo)]">
          {person.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm text-[var(--black)]">{person.name}</h3>
            {hasSocialLinks && (
              <div className="flex items-center gap-1.5">
                {person.linkedin && (
                  <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors">
                    <LinkedInIcon className="h-3.5 w-3.5" />
                  </a>
                )}
                {person.twitter && (
                  <a href={person.twitter} target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors">
                    <XIcon className="h-3.5 w-3.5" />
                  </a>
                )}
                {person.website && (
                  <a href={person.website} target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors">
                    <WebsiteIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-[var(--pro-indigo)] mt-0.5">
            {person.role}
          </p>
        </div>
      </div>
      {person.bio && (
        <p className="mt-3 text-sm text-[var(--muted)] font-light">{person.bio}</p>
      )}
      {person.currentPosition && (
        <p className="mt-2 text-sm text-[var(--muted)] font-light">Now: {person.currentPosition}</p>
      )}
      {person.email && (
        <div className="mt-3">
          <a href={`mailto:${person.email}`} className="font-mono text-xs text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors">
            [email]
          </a>
        </div>
      )}
    </div>
  );
}

export default async function PeoplePage() {
  const people = await getPeople().catch(() => []);

  // Separate team members from alumni
  const team = people.filter((p) => p.role !== 'Alumni');
  const alumni = people.filter((p) => p.role === 'Alumni');

  // Placeholder data if no Notion data
  const showPlaceholder = people.length === 0;
  const placeholderTeam = [
    { id: '1', name: 'Engy Ziedan, Ph.D.', role: 'Assistant Professor', bio: 'Indiana University Assistant Professor and Applied Economist with training in econometrics (statistics + microeconomic theory)', order: 1 },
    { id: '2', name: 'Si-Yuan Kong, Ph.D.', role: 'Senior Scientist', bio: 'UC Irvine-trained machine learning senior scientist (formerly at Activision)', order: 2 },
    { id: '3', name: 'Allison Fox', role: 'Research Scientist', bio: 'UC Berkeley-trained measurement theory expert with AI safety and data error experience (formerly at Mathematica)', order: 3 },
    { id: '4', name: 'Sarah Tucker', role: 'Researcher', bio: 'Columbia University trained. Qualitative and quantitative researcher with healthcare data experience (formerly at Datavant)', order: 4 },
  ];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="text-3xl tracking-tight text-[var(--black)]">People</h1>
        <p className="mt-3 text-[var(--muted)] font-light">
          Meet the team at Protege Data Lab.
        </p>

        {showPlaceholder && (
          <p className="mt-4 font-mono text-sm text-[var(--muted)]">
            // Placeholder data
          </p>
        )}

        {/* Team */}
        <section className="mt-14">
          <h2 className="text-xs font-mono uppercase tracking-wide text-[var(--muted)] mb-6">Team</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {(showPlaceholder ? placeholderTeam : team).map((person) => (
              <PersonCard key={person.id} person={person as Person} />
            ))}
          </div>
        </section>

        {/* Alumni */}
        {(alumni.length > 0 || showPlaceholder) && (
          <section className="mt-14">
            <h2 className="text-xs font-mono uppercase tracking-wide text-[var(--muted)] mb-6">Alumni</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {alumni.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
            {alumni.length === 0 && showPlaceholder && (
              <p className="font-mono text-sm text-[var(--muted)]">// No alumni yet</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
