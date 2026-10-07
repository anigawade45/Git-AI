import { useEffect } from 'react';

export function useMeta({
  title = 'GitHub Knowledge Assistant | AI-Powered Repository Analysis',
  description = 'Understand, analyze, and document GitHub repositories using an AI-powered knowledge assistant.',
  robots = 'index, follow',
  canonical,
}) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Update Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;

    // 3. Update Robots Meta Tag
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = robots;

    // 4. Update Canonical URL if provided
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.rel = 'canonical';
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.href = canonical;
    }
  }, [title, description, robots, canonical]);
}
