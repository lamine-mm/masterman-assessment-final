import { ButtonLink } from "@/components/ui/button-link";
import type { WebinarCopy } from "@/lib/content";
import type { CurrentWebinar } from "@/lib/webinar";

/**
 * Free live class CTA. "banner" sits above the result hero and leads with the
 * class itself; "card" sits under the "What your code means" legend and bridges
 * from his result. Topic + date come from the live webinar registry, so both
 * roll forward on their own when a new class is created in /admin.
 * Opens in a new tab so the man keeps his result open.
 */
export function WebinarCta({
  variant,
  copy,
  webinar,
  href,
}: {
  variant: "banner" | "card";
  copy: WebinarCopy;
  webinar: CurrentWebinar;
  href: string;
}) {
  const title = webinar.title ?? copy.fallbackTitle;
  const body = webinar.body ?? copy.fallbackBody;

  if (variant === "banner") {
    return (
      <aside className="mb-4 sm:mb-5 rounded-md border border-primary/40 bg-primary/[0.08] px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="eyebrow">{copy.eyebrow}</p>
            <p className="font-display text-[19px] sm:text-[21px] text-foreground leading-snug tracking-[-0.01em]">
              {title}
            </p>
            <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
              {body}
            </p>
            {webinar.dateLine ? (
              <p className="text-xs text-primary/90 leading-relaxed pt-0.5">
                {webinar.dateLine}
              </p>
            ) : null}
          </div>
          <ButtonLink
            href={href}
            external
            newTab
            className="w-full shrink-0 sm:w-auto"
          >
            {copy.button}
          </ButtonLink>
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-md border border-primary/30 bg-primary/[0.05] px-5 py-5 sm:px-6 space-y-2">
      <p className="eyebrow">{copy.eyebrow}</p>
      <p className="font-display text-[18px] sm:text-[20px] text-foreground leading-snug tracking-[-0.01em]">
        {copy.bridge}
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        <span className="text-foreground/80">&ldquo;{title}&rdquo;</span>
        {" — "}
        {copy.nextClassLabel}
        {webinar.dateLine ? <>. {webinar.dateLine}</> : null}
      </p>
      <div className="pt-2">
        <ButtonLink
          href={href}
          external
          newTab
          className="h-auto min-h-11 w-full whitespace-normal px-4 py-2.5 text-center leading-snug sm:w-auto sm:px-7"
        >
          {copy.button}
        </ButtonLink>
      </div>
    </aside>
  );
}
