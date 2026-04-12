interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
}

export function SectionHeading({ eyebrow, title, description, centered = false }: SectionHeadingProps) {
  return (
    <div className={`page-intro ${centered ? 'section-heading-balanced' : ''}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="font-serif-display text-3xl text-pine dark:text-stone-100 sm:text-4xl">{title}</h2>
      {description ? <p className="page-copy">{description}</p> : null}
    </div>
  );
}
