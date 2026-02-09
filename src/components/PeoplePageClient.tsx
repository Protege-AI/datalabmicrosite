'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Person } from '@/lib/notion';
import { nameToSlug, slugMatches } from '@/lib/utils';
import PersonCard from './PersonCard';
import PersonModal from './PersonModal';

interface PeoplePageClientProps {
  team: Person[];
  alumni: Person[];
  showPlaceholder: boolean;
}

export default function PeoplePageClient({ team, alumni, showPlaceholder }: PeoplePageClientProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // All people combined for lookup
  const allPeople = useMemo(() => [...team, ...alumni], [team, alumni]);

  // Check URL for person param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const personSlug = params.get('person');

    if (personSlug) {
      const person = allPeople.find(p => slugMatches(p.name, personSlug));
      if (person) {
        setSelectedPerson(person);
      }
    }
  }, [allPeople]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const personSlug = params.get('person');

      if (personSlug) {
        const person = allPeople.find(p => slugMatches(p.name, personSlug));
        setSelectedPerson(person || null);
      } else {
        setSelectedPerson(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allPeople]);

  const openModal = useCallback((person: Person) => {
    setSelectedPerson(person);
    const slug = nameToSlug(person.name);
    window.history.pushState({}, '', `/people?person=${slug}`);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPerson(null);
    window.history.pushState({}, '', '/people');
  }, []);

  return (
    <>
      {/* Team */}
      <section className="mt-14">
        <h2 className="text-xs font-mono uppercase tracking-wide text-[var(--muted)] mb-6">Team</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {team.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onCardClick={() => openModal(person)}
            />
          ))}
        </div>
      </section>

      {/* Alumni */}
      {(alumni.length > 0 || showPlaceholder) && (
        <section className="mt-14">
          <h2 className="text-xs font-mono uppercase tracking-wide text-[var(--muted)] mb-6">Alumni</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {alumni.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onCardClick={() => openModal(person)}
              />
            ))}
          </div>
          {alumni.length === 0 && showPlaceholder && (
            <p className="font-mono text-sm text-[var(--muted)]">// No alumni yet</p>
          )}
        </section>
      )}

      {/* Modal */}
      {selectedPerson && (
        <PersonModal person={selectedPerson} onClose={closeModal} />
      )}
    </>
  );
}
