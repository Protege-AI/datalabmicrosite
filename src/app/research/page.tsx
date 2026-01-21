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
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-4xl font-bold text-gray-900">Research</h1>
        <p className="mt-4 text-lg text-gray-600">
          Publications, working papers, and ongoing research projects from Protege Data Lab.
        </p>

        {/* Research Projects */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Research Projects</h2>
          {showPlaceholderProjects && (
            <p className="mt-2 text-sm text-gray-500 italic">
              Add research projects in Notion to see them here.
            </p>
          )}
          <div className="mt-6 space-y-6">
            {displayProjects.map((project) => (
              <div key={project.id} className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      project.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="mt-4 text-gray-600">{project.description}</p>
                {project.team && (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-500">Team: </span>
                    <span className="text-sm text-gray-700">{project.team}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Publications */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Publications</h2>
          {showPlaceholderPubs && (
            <p className="mt-2 text-sm text-gray-500 italic">
              Add publications in Notion to see them here.
            </p>
          )}
          <div className="mt-6 space-y-10">
            {years.map((year) => (
              <div key={year}>
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                  {year}
                </h3>
                <ul className="mt-4 space-y-6">
                  {pubsByYear[year].map((paper) => (
                    <li key={paper.id} className="border-l-2 border-blue-200 pl-4">
                      <h4 className="text-lg font-semibold text-gray-900">{paper.title}</h4>
                      <p className="mt-1 text-gray-600">{paper.authors}</p>
                      <p className="text-sm font-medium text-blue-600">{paper.venue}</p>
                      <div className="mt-2 flex gap-4">
                        {paper.paperUrl && (
                          <a
                            href={paper.paperUrl}
                            className="text-sm text-gray-500 hover:text-blue-600"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            [Paper]
                          </a>
                        )}
                        {paper.codeUrl && (
                          <a
                            href={paper.codeUrl}
                            className="text-sm text-gray-500 hover:text-blue-600"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            [Code]
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
