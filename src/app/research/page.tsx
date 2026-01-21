import Image from 'next/image';
import { getPublications, getResearchProjects } from '@/lib/notion';

export const revalidate = 60;

export default async function ResearchPage() {
  const [publications, projects] = await Promise.all([
    getPublications().catch(() => []),
    getResearchProjects().catch(() => []),
  ]);

  // Placeholder data if no Notion data
  const showPlaceholderPubs = publications.length === 0;
  const showPlaceholderProjects = projects.length === 0;

  const placeholderPubs = [
    { id: '1', title: 'Efficient Data Pipeline Orchestration at Scale', authors: 'A. Johnson, J. Smith', venue: 'ICML 2025', year: 2025, paperUrl: '#', codeUrl: '#' },
    { id: '2', title: 'Learning to Detect Data Quality Issues', authors: 'M. Garcia, J. Smith', venue: 'NeurIPS 2024', year: 2024, paperUrl: '#', codeUrl: '#' },
  ];

  const placeholderProjects = [
    { id: '1', title: 'Scalable Data Pipeline Infrastructure', description: 'Building next-generation data processing systems.', status: 'Active', tags: ['Data Systems'], team: '', order: 0 },
    { id: '2', title: 'ML-Powered Data Quality', description: 'Machine learning techniques for data quality at scale.', status: 'Active', tags: ['Machine Learning'], team: '', order: 1 },
  ];

  const displayPubs = showPlaceholderPubs ? placeholderPubs : publications;
  const displayProjects = showPlaceholderProjects ? placeholderProjects : projects;

  // Group publications by year
  const pubsByYear = displayPubs.reduce((acc, pub) => {
    const year = pub.year.toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(pub);
    return acc;
  }, {} as Record<string, typeof displayPubs>);

  const years = Object.keys(pubsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header with illustration */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center mb-14">
          <div>
            <h1 className="text-3xl tracking-tight text-[var(--black)]">Research</h1>
            <p className="mt-3 text-[var(--muted)] font-light">
              Publications, working papers, and ongoing research projects.
            </p>
          </div>
          <div className="relative h-48 overflow-hidden border border-[var(--cloud)]">
            <Image
              src="/images/illustrations.png"
              alt="Abstract illustrations"
              fill
              className="object-cover object-[0%_0%]"
              priority
            />
          </div>
        </div>

        {/* Research Projects */}
        <section>
          <h2 className="text-xs font-mono uppercase tracking-wide text-[var(--muted)] mb-6">Projects</h2>
          {showPlaceholderProjects && (
            <p className="mb-4 font-mono text-sm text-[var(--muted)]">
              // Placeholder data
            </p>
          )}
          <div className="space-y-4">
            {displayProjects.map((project) => (
              <div key={project.id} className="border border-[var(--cloud)] p-5 hover:border-[var(--pro-indigo)]/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-mono text-sm text-[var(--black)]">{project.title}</h3>
                    <p className="mt-2 text-sm text-[var(--muted)] font-light">{project.description}</p>
                    {project.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-xs text-[var(--pro-indigo)]"
                          >
                            [{tag}]
                          </span>
                        ))}
                      </div>
                    )}
                    {project.team && (
                      <p className="mt-3 font-mono text-xs text-[var(--muted)]">
                        Team: {project.team}
                      </p>
                    )}
                  </div>
                  <span
                    className={`font-mono text-xs shrink-0 ${
                      project.status === 'Active'
                        ? 'text-[var(--pro-indigo)]'
                        : 'text-[var(--muted)]'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Publications */}
        <section className="mt-16">
          <h2 className="text-xs font-mono uppercase tracking-wide text-[var(--muted)] mb-6">Publications</h2>
          {showPlaceholderPubs && (
            <p className="mb-4 font-mono text-sm text-[var(--muted)]">
              // Placeholder data
            </p>
          )}
          <div className="space-y-10">
            {years.map((year) => (
              <div key={year}>
                <h3 className="font-mono text-sm text-[var(--black)] border-b border-[var(--cloud)] pb-2 mb-4">
                  {year}
                </h3>
                <ul className="space-y-5">
                  {pubsByYear[year].map((paper) => (
                    <li key={paper.id} className="border-l border-[var(--cloud)] pl-4">
                      <h4 className="text-base text-[var(--black)]">{paper.title}</h4>
                      <p className="mt-1 text-sm text-[var(--muted)] font-light">{paper.authors}</p>
                      <p className="font-mono text-xs text-[var(--muted)] mt-1">{paper.venue}</p>
                      <div className="mt-2 flex gap-3">
                        {paper.paperUrl && (
                          <a
                            href={paper.paperUrl}
                            className="font-mono text-xs text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            [paper]
                          </a>
                        )}
                        {paper.codeUrl && (
                          <a
                            href={paper.codeUrl}
                            className="font-mono text-xs text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            [code]
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
