interface DisclaimerPSProps {
  text: string;
}

/**
 * Always present at the bottom of the result page — never omitted.
 */
export function DisclaimerPS({ text }: DisclaimerPSProps) {
  return (
    <p className="text-xs text-muted-foreground leading-relaxed text-center px-2 sm:px-4 pt-8 pb-10 border-t border-border mt-2">
      <span className="font-semibold text-muted-foreground">P.S.</span> {text}
    </p>
  );
}
