import type { WorkoutRecordDto } from 'shared/api/generated/models';

export function getWorkoutRecordRoute(record: WorkoutRecordDto) {
  if (record.source === 'manual') {
    return {
      name: '/exercise-form' as const,
      params: {
        recordId: record.id,
      },
    };
  }

  return {
    name: '/exercise-record-detail' as const,
    params: {
      recordId: record.id,
    },
  };
}
