import type { ExerciseGuide } from "../types/exercise-guide";

export function filterBodyPartGuides(
  guides: ExerciseGuide[],
  selectedBodyPart: string,
) {
  if (selectedBodyPart === "전체") {
    return guides;
  }

  return guides.filter((guide) => guide.bodyPart === selectedBodyPart);
}

export function filterEquipmentGuides(
  guides: ExerciseGuide[],
  selectedEquipmentType: string,
) {
  if (selectedEquipmentType === "전체") {
    return guides;
  }

  return guides.filter((guide) =>
    guide.equipmentTypes.includes(selectedEquipmentType),
  );
}
