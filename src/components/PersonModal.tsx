'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Person, ContentBlock } from '@/lib/notion';
import { BlockRenderer } from './BlockRenderer';
import { LinkedInIcon, XIcon, WebsiteIcon, GoogleScholarIcon, CloseIcon } from './icons';

interface PersonModalProps {
  person: Person;
  onClose: () => void;
}

export default function PersonModal({ person, onClose }: PersonModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [bioContent, setBioContent] = useState<ContentBlock[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch bio content from Notion page
  useEffect(() => {
    let cancelled = false;

    async function fetchBio() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/people/${person.id}/bio`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setBioContent(data.content);
          }
        } else {
          if (!cancelled) setError(true);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBio();
    return () => { cancelled = true; };
  }, [person.id]);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const hasSocialLinks = person.linkedin || person.twitter || person.website || person.googleScholar;
  const hasContent = bioContent && bioContent.length > 0;

  const modalContent = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="person-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white border border-[var(--cloud)] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--muted)] hover:text-[var(--black)] transition-colors z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-indigo)]"
          aria-label="Close modal"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-5 sm:p-8">
          {/* Header: Photo + Name/Role/Links */}
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Photo */}
            {person.photo ? (
              <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={person.photo}
                  alt={person.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized={person.photo.includes('notion') || person.photo.includes('s3.us-west-2')}
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-[var(--powder)]/30 flex items-center justify-center shrink-0 font-mono text-base sm:text-xl text-[var(--pro-indigo)] rounded-full">
                {person.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0 pt-2">
              <h2 id="person-modal-title" className="text-xl font-mono text-[var(--black)]">
                {person.name}
              </h2>
              <p className="text-sm text-[var(--pro-indigo)] mt-1">
                {person.role}
              </p>

              {/* Social links */}
              {hasSocialLinks && (
                <div className="flex items-center gap-3 mt-4">
                  {person.linkedin && (
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors"
                      aria-label="LinkedIn profile"
                    >
                      <LinkedInIcon className="w-5 h-5" />
                    </a>
                  )}
                  {person.twitter && (
                    <a
                      href={person.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors"
                      aria-label="X (Twitter) profile"
                    >
                      <XIcon className="w-5 h-5" />
                    </a>
                  )}
                  {person.website && (
                    <a
                      href={person.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors"
                      aria-label="Personal website"
                    >
                      <WebsiteIcon className="w-5 h-5" />
                    </a>
                  )}
                  {person.googleScholar && (
                    <a
                      href={person.googleScholar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors"
                      aria-label="Google Scholar profile"
                    >
                      <GoogleScholarIcon className="w-5 h-5" />
                    </a>
                  )}
                  {person.email && (
                    <a
                      href={`mailto:${person.email}`}
                      className="font-mono text-xs text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors ml-2"
                    >
                      [email]
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--cloud)] my-6" />

          {/* Bio content from Notion */}
          <div className="text-[15px] text-[var(--black)]/80 font-normal leading-[1.8] tracking-[0.01em]">
            {loading ? (
              <div className="flex items-center gap-2 py-8 justify-center">
                <div className="w-4 h-4 border-2 border-[var(--pro-indigo)]/30 border-t-[var(--pro-indigo)] rounded-full animate-spin" />
                <span className="font-mono text-xs text-[var(--muted)]">Loading bio...</span>
              </div>
            ) : error ? (
              <p className="text-center py-4 font-mono text-xs text-[var(--muted)]">
                Could not load full bio.
              </p>
            ) : hasContent ? (
              <div className="max-w-prose">
                {bioContent.map((block) => (
                  <BlockRenderer key={block.id} block={block} compact={true} />
                ))}
              </div>
            ) : person.bio ? (
              <p>{person.bio}</p>
            ) : (
              <p className="text-center py-4 font-mono text-xs text-[var(--muted)]">
                No bio available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
