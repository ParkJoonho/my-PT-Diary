import type {
  BodyPartFilterItem,
  EquipmentFilterItem,
} from "../types/exercise-guide";

export const BODY_PART_FILTERS: BodyPartFilterItem[] = [
  { image: null, key: "전체", label: "전체" },
  {
    image: require("../../../assets/icons/body_chest.png"),
    key: "가슴",
    label: "가슴",
  },
  {
    image: require("../../../assets/icons/body_back.png"),
    key: "등",
    label: "등",
  },
  {
    image: require("../../../assets/icons/body_shoulder.png"),
    key: "어깨",
    label: "어깨",
  },
  {
    image: require("../../../assets/icons/body_arm.png"),
    key: "팔",
    label: "팔",
  },
  {
    image: require("../../../assets/icons/body_legs.png"),
    key: "하체",
    label: "하체",
  },
  {
    image: require("../../../assets/icons/body_core.png"),
    key: "복근",
    label: "복근",
  },
];

export const EQUIPMENT_FILTERS: EquipmentFilterItem[] = [
  { key: "전체", label: "전체" },
  { key: "맨몸", label: "맨몸" },
  { key: "바벨", label: "바벨" },
  { key: "덤벨", label: "덤벨" },
  { key: "케이블", label: "케이블" },
  { key: "머신", label: "머신" },
];
