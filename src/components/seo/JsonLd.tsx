import { memo } from 'react';

interface JsonLdProps {
  schema: Record<string, any>;
}

export const JsonLd = memo(({ schema }: JsonLdProps) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
});

JsonLd.displayName = 'JsonLd';