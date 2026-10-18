import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

export default defineConfig({
  integrations: [
    mermaid({ autoTheme: true }),
    starlight({
      title: 'Weather Starter',
      sidebar: [
        { label: 'Guides', autogenerate: { directory: 'guides' } },
        { label: 'Architecture', autogenerate: { directory: 'architecture' } },
        { label: 'Reference', autogenerate: { directory: 'reference' } },
      ],
    }),
  ],
});
