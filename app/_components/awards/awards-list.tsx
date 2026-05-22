import { type Language } from "@/lib/i18n/dictionary";
import AwardsSection, { type AwardData } from "./awards-section";

// Award images: no Figma media assets uploaded for award section images.
// Using placeholder path — orchestrator should replace with actual images.
// Each slug maps to /awards/<slug>.png when real images are available.
const PLACEHOLDER = "/awards/placeholder.svg";

const AWARDS: AwardData[] = [
  {
    slug: "top-talent",
    imageLeft: true,
    imageSrc: PLACEHOLDER,
    titleKey: "awards.section.top-talent.title",
    descriptionKey: "awards.section.top-talent.description",
    countKey: "awards.section.top-talent.count",
    countUnitKey: "awards.section.top-talent.count_unit",
    valueKey: "awards.section.top-talent.value",
    valueUnitKey: "awards.section.top-talent.value_unit",
  },
  {
    slug: "top-project",
    imageLeft: false,
    imageSrc: PLACEHOLDER,
    titleKey: "awards.section.top-project.title",
    descriptionKey: "awards.section.top-project.description",
    countKey: "awards.section.top-project.count",
    countUnitKey: "awards.section.top-project.count_unit",
    valueKey: "awards.section.top-project.value",
    valueUnitKey: "awards.section.top-project.value_unit",
  },
  {
    slug: "top-project-leader",
    imageLeft: true,
    imageSrc: PLACEHOLDER,
    titleKey: "awards.section.top-project-leader.title",
    descriptionKey: "awards.section.top-project-leader.description",
    countKey: "awards.section.top-project-leader.count",
    countUnitKey: "awards.section.top-project-leader.count_unit",
    valueKey: "awards.section.top-project-leader.value",
    valueUnitKey: "awards.section.top-project-leader.value_unit",
  },
  {
    slug: "best-manager",
    imageLeft: false,
    imageSrc: PLACEHOLDER,
    titleKey: "awards.section.best-manager.title",
    descriptionKey: "awards.section.best-manager.description",
    countKey: "awards.section.best-manager.count",
    countUnitKey: "awards.section.best-manager.count_unit",
    valueKey: "awards.section.best-manager.value",
    valueUnitKey: "awards.section.best-manager.value_unit",
  },
  {
    slug: "signature-2025-creator",
    imageLeft: true,
    imageSrc: PLACEHOLDER,
    titleKey: "awards.section.signature-2025-creator.title",
    descriptionKey: "awards.section.signature-2025-creator.description",
    countKey: "awards.section.signature-2025-creator.count",
    countUnitKey: "awards.section.signature-2025-creator.count_unit",
    valueKey: "awards.section.signature-2025-creator.value",
    valueUnitKey: "awards.section.signature-2025-creator.value_unit",
    value2Key: "awards.section.signature-2025-creator.value2",
    value2UnitKey: "awards.section.signature-2025-creator.value2_unit",
    orKey: "awards.section.signature-2025-creator.or",
  },
  {
    slug: "mvp",
    imageLeft: false,
    imageSrc: PLACEHOLDER,
    titleKey: "awards.section.mvp.title",
    descriptionKey: "awards.section.mvp.description",
    countKey: "awards.section.mvp.count",
    countUnitKey: "awards.section.mvp.count_unit",
    valueKey: "awards.section.mvp.value",
    valueUnitKey: "awards.section.mvp.value_unit",
  },
];

type AwardsListProps = {
  lang: Language;
};

export default function AwardsList({ lang }: AwardsListProps) {
  return (
    <div className="flex flex-col" style={{ gap: 80, flex: 1, minWidth: 0 }}>
      {AWARDS.map((award) => (
        <AwardsSection key={award.slug} lang={lang} award={award} />
      ))}
    </div>
  );
}
