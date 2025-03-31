"use client";

interface GlobalStylesProps {
  fontFamily: string;
}

export default function GlobalStyles({ fontFamily }: GlobalStylesProps) {
  return (
    <style jsx global>{`
      .title-font {
        font-family: ${fontFamily};
      }
    `}</style>
  );
}
