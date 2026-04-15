import Image from "next/image";

interface MastermanLogoProps {
  size?: number;
  className?: string;
}

export function MastermanLogo({ size = 48, className }: MastermanLogoProps) {
  return (
    <Image
      src="/MasterMan_Logo_WhiteText_ColorImage.png"
      alt="Masterman"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
