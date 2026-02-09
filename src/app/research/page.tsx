import Image from 'next/image';
import Link from 'next/link';
import { getResearchProjects } from '@/lib/notion';
import { nameToSlug, formatDate, isNotionImage } from '@/lib/utils';
import { getArticleTypeColor } from '@/lib/constants';

export const revalidate = 3600;

export const metadata = {
  title: 'Research',
  description: 'Research, ideas, and publications that explore AI\'s data frontier.',
};

export default async function ResearchPage() {
  const projects = await getResearchProjects().catch(() => []);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header with illustration */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center mb-14">
          <div>
            <h1 className="text-3xl tracking-tight text-[var(--black)]">Research</h1>
            <p className="mt-3 text-[var(--muted)] font-light">
              Research, ideas, and publications that explore AI's data frontier.
            </p>
          </div>
          <div className="relative h-48 overflow-hidden border border-[var(--cloud)]">
            <Image
              src="/images/illustrations.webp"
              alt="Abstract illustrations"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[0%_0%]"
              priority
            />
          </div>
        </div>

        {/* Research Projects */}
        <section>
          {projects.length === 0 ? (
            <p className="text-[var(--muted)] font-light">No research projects available.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="relative border border-[var(--cloud)] hover:border-[var(--pro-indigo)]/30 transition-colors flex flex-col sm:flex-row"
                >
                  {/* Full card clickable link */}
                  <Link
                    href={`/research/${project.id}`}
                    className="absolute inset-0 z-0"
                    aria-label={`Read ${project.title}`}
                  />
                  {/* Preview Image */}
                  {project.previewImage && (
                    <div className="shrink-0 flex items-center justify-center sm:justify-start bg-[var(--cloud)]/20 h-[140px] sm:h-auto sm:max-h-[120px]">
                      <Image
                        src={project.previewImage}
                        alt={project.title}
                        width={200}
                        height={120}
                        className="object-contain max-h-[120px] w-auto"
                        unoptimized={isNotionImage(project.previewImage)}
                      />
                    </div>
                  )}
                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="font-mono text-sm text-[var(--black)]">{project.title}</h3>
                      <p className="mt-1 text-xs text-[var(--muted)] font-light">
                        by{' '}
                        <Link
                          href={`/people?person=${nameToSlug(project.authors?.split(',')[0]?.trim() || 'data-lab')}`}
                          className="relative z-10 hover:text-[var(--pro-indigo)] transition-colors"
                        >
                          {project.authors || 'Data Lab'}
                        </Link>
                      </p>
                      <p className="mt-2 text-sm text-[var(--muted)] font-light">{project.description}</p>
                      {project.tags && project.tags.length > 0 && (
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
                    <div className="shrink-0 sm:text-right flex sm:flex-col gap-2 sm:gap-0 mt-2 sm:mt-0">
                      {project.articleType && (
                        <span className={`font-mono text-xs ${getArticleTypeColor(project.articleType).text}`}>
                          {project.articleType}
                        </span>
                      )}
                      {project.date && (
                        <span className="font-mono text-xs text-[var(--muted)] sm:mt-1">
                          {formatDate(project.date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
