interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

const dotSizes = {
  sm: "h-1.5 w-1.5 ml-1.5",
  md: "h-2 w-2 ml-2",
  lg: "h-2.5 w-2.5 ml-2",
};

export const Logo = ({ size = "md" }: LogoProps) => {
  return (
    <div className="inline-flex items-baseline">
      <span className={`font-display text-foreground ${sizes[size]}`}>
        SoloBlueprint
      </span>
      <span
        className={`inline-block rounded-full bg-primary ${dotSizes[size]}`}
        aria-hidden="true"
      />
    </div>
  );
};
