import Image from "next/image";
import Link from "next/link";
import { t, type Language } from "@/lib/i18n/dictionary";

export type AwardSlug =
  | "top-talent"
  | "top-project"
  | "top-project-leader"
  | "best-manager"
  | "signature-2025-creator"
  | "mvp";

export type AwardCardData = {
  slug: AwardSlug;
  titleKey:
    | "home.awards.top-talent.title"
    | "home.awards.top-project.title"
    | "home.awards.top-project-leader.title"
    | "home.awards.best-manager.title"
    | "home.awards.signature-2025-creator.title"
    | "home.awards.mvp.title";
  descriptionKey:
    | "home.awards.top-talent.description"
    | "home.awards.top-project.description"
    | "home.awards.top-project-leader.description"
    | "home.awards.best-manager.description"
    | "home.awards.signature-2025-creator.description"
    | "home.awards.mvp.description";
};

function ArrowUpRightIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7M17 7H7M17 7V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type HomeAwardCardProps = {
  lang: Language;
  award: AwardCardData;
};

export default function HomeAwardCard({ lang, award }: HomeAwardCardProps) {
  return (
    <article
      className="flex flex-col group transition-all duration-200 hover:-translate-y-1 w-full"
      style={{ gap: 24, cursor: "default" }}
    >
      {/* Thumbnail — square award photo (orb + name baked in), shared with the
          Awards page (/shared/<slug>-v2.png), sized for the home 3-col grid.
          Yellow border + glow per Figma mms_C2.1.1_Picture-Award (336×336). */}
      <div
        className="relative overflow-hidden w-full aspect-square"
        style={{
          // Figma mms_C2.1.1_Picture-Award: screen blend so the photo's dark
          // background merges into the page (orb appears to float) + glow.
          // Inner border/radius from MM_MEDIA_Award BG (0.955px gold, radius 24).
          borderRadius: 24,
          border: "0.955px solid #FFEA9E",
          boxShadow: "0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287",
          mixBlendMode: "screen",
          transition: "box-shadow 0.2s ease",
        }}
      >
        <Image
          src={`/shared/${award.slug}-v2.png`}
          alt={t(lang, award.titleKey)}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 336px"
          className="object-cover"
          unoptimized
        />

        {/* Hover glow overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(250,226,135,0.18) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Card body */}
      <div className="flex flex-col" style={{ gap: 4 }}>
        {/* Title */}
        <h3
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(18px, 3vw, 24px)",
            fontWeight: 400,
            lineHeight: "1.33",
            color: "#FFEA9E",
            margin: 0,
          }}
        >
          {t(lang, award.titleKey)}
        </h3>

        {/* Description — max 2 lines with ellipsis */}
        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 16,
            fontWeight: 400,
            lineHeight: "24px",
            letterSpacing: "0.5px",
            color: "#FFFFFF",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {t(lang, award.descriptionKey)}
        </p>

        {/* Detail link — Figma I2167:9075;214:1023: text-only button, no border. */}
        <Link
          href={`/awards#${award.slug}`}
          className="inline-flex items-center transition-colors duration-200 hover:text-[#FFEA9E]"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 16,
            fontWeight: 500,
            lineHeight: "24px",
            letterSpacing: "0.15px",
            color: "#FFFFFF",
            textDecoration: "none",
            padding: "16px 0",
            gap: 4,
            width: 88,
            height: 56,
          }}
        >
          {t(lang, "home.awards.detail.link")}
          <ArrowUpRightIcon />
        </Link>
      </div>
    </article>
  );
}
