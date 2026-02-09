import { getPeople, Person } from '@/lib/notion';
import PeoplePageClient from '@/components/PeoplePageClient';
import Image from 'next/image';

export const revalidate = 300;

export const metadata = {
  title: 'People',
  description: 'Meet the research scientists behind Data Lab — our team of experts in econometrics, machine learning, measurement theory, and healthcare data.',
};

export default async function PeoplePage() {
  const people = await getPeople().catch(() => []);

  // Separate team members from alumni
  const team = people.filter((p) => p.role !== 'Alumni');
  const alumni = people.filter((p) => p.role === 'Alumni');

  // Placeholder data if no Notion data
  const showPlaceholder = people.length === 0;
  const placeholderTeam: Person[] = [
    { id: '1', name: 'Engy Ziedan, Ph.D.', role: 'Assistant Professor', bio: 'Indiana University Assistant Professor and Applied Economist with training in econometrics (statistics + microeconomic theory)', order: 1 },
    { id: '2', name: 'Si-Yuan Kong, Ph.D.', role: 'Senior Scientist', bio: 'UC Irvine-trained machine learning senior scientist (formerly at Activision)', order: 2 },
    { id: '3', name: 'Allison Fox', role: 'Research Scientist', bio: 'UC Berkeley-trained measurement theory expert with AI safety and data error experience (formerly at Mathematica)', order: 3 },
    { id: '4', name: 'Sarah Tucker', role: 'Researcher', bio: 'Columbia University trained. Qualitative and quantitative researcher with healthcare data experience (formerly at Datavant)', order: 4 },
  ];

  const displayTeam = showPlaceholder ? placeholderTeam : team;

  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col md:flex-row md:items-center md:gap-10 mb-10">
          <div className="md:w-2/3">
            <h1 className="text-3xl tracking-tight text-[var(--black)]">People</h1>
            <p className="mt-3 text-[var(--muted)] font-light">
              We are a team of research scientists committed to tackling the fundamental challenges and open questions regarding data for AI.
            </p>
          </div>
          <div className="mt-6 md:mt-0 md:w-1/3">
            <Image
              src="/images/data-lab-offsite-feb-2026.png"
              alt="Data Lab team at the February 2026 offsite"
              width={1200}
              height={800}
              className="w-full rounded-lg"
              priority
            />
          </div>
        </div>

        {showPlaceholder && (
          <p className="mt-4 font-mono text-sm text-[var(--muted)]">
            // Placeholder data
          </p>
        )}

        <PeoplePageClient
          team={displayTeam}
          alumni={alumni}
          showPlaceholder={showPlaceholder}
        />
      </div>
    </div>
  );
}
