'use client';

import Image from 'next/image';
import { Person } from '@/lib/notion';
import { LinkedInIcon, XIcon, WebsiteIcon, GoogleScholarIcon } from './icons';

interface PersonCardProps {
  person: Person;
  onCardClick?: () => void;
}

export default function PersonCard({ person, onCardClick }: PersonCardProps) {
  const hasSocialLinks = person.linkedin || person.twitter || person.website || person.googleScholar;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick?.();
    }
  };

  return (
    <div
      className="group border border-[var(--cloud)] p-5 hover:border-[var(--pro-indigo)]/30 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-indigo)]"
      onClick={onCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${person.name}`}
    >
      <div className="flex items-start gap-4">
        {person.photo ? (
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
            <Image
              src={person.photo}
              alt={person.name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
              unoptimized={person.photo.includes('notion') || person.photo.includes('s3.us-west-2')}
            />
          </div>
        ) : (
          <div className="h-12 w-12 bg-[var(--powder)]/30 flex items-center justify-center shrink-0 font-mono text-xs text-[var(--pro-indigo)] rounded-full">
            {person.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="font-mono text-sm text-[var(--black)] truncate">{person.name}</h3>
            {hasSocialLinks && (
              <div className="flex items-center shrink-0 gap-0.5" onClick={(e) => e.stopPropagation()}>
                {person.linkedin && (
                  <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors p-2" aria-label="LinkedIn profile">
                    <LinkedInIcon className="h-3.5 w-3.5" />
                  </a>
                )}
                {person.twitter && (
                  <a href={person.twitter} target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors p-2" aria-label="X (Twitter) profile">
                    <XIcon className="h-3.5 w-3.5" />
                  </a>
                )}
                {person.website && (
                  <a href={person.website} target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors p-2" aria-label="Personal website">
                    <WebsiteIcon className="h-3.5 w-3.5" />
                  </a>
                )}
                {person.googleScholar && (
                  <a href={person.googleScholar} target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors p-2" aria-label="Google Scholar profile">
                    <GoogleScholarIcon className="h-3.5 w-3.5" />
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
      {/* Click for more hint */}
      <div className="mt-4 flex justify-end">
        <span className="font-mono text-xs text-[var(--orange)] group-hover:text-[var(--orange)]/70 transition-colors">
          Click for more →
        </span>
      </div>
    </div>
  );
}
