import type { WorkoutRecordDto } from 'shared/api/generated/models';
import { type StateCreator, create } from 'zustand';
import {
  type ManualWorkoutFormState,
  createEmptyManualStrengthExercise,
  createEmptyManualWorkoutSet,
  createManualWorkoutFormState,
  createManualWorkoutFormStateFromRecord,
  recalculateManualStrengthExercise,
} from '../lib/manual-workout-form';

type CardioFieldKey =
  | 'cycleMinutes'
  | 'stairClimberMinutes'
  | 'steps'
  | 'treadmillMinutes';
type BodyCompositionFieldKey =
  | 'bodyFatKg'
  | 'bodyFatPercentage'
  | 'eveningWeightKg'
  | 'morningWeightKg'
  | 'skeletalMuscleMassKg';
type TextFieldKey =
  | 'activityLevel'
  | 'condition'
  | 'dailyReport'
  | 'exerciseTime'
  | 'sleep';

export type ManualWorkoutFormDraftSlice = {
  addSet: (exerciseIndex: number) => void;
  addStrengthExercise: () => void;
  form: ManualWorkoutFormState;
  hydrateFromRecord: (record: WorkoutRecordDto) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  removeStrengthExercise: (exerciseIndex: number) => void;
  resetForCreate: () => void;
  setPerformedOn: (value: string) => void;
  setBodyCompositionField: (
    key: BodyCompositionFieldKey,
    value: string,
  ) => void;
  setCardioField: (key: CardioFieldKey, value: string) => void;
  setMeal: (mealIndex: number, value: string) => void;
  setStrengthExerciseName: (exerciseIndex: number, value: string) => void;
  setStrengthExerciseRestTime: (exerciseIndex: number, value: string) => void;
  setStrengthExerciseRir: (exerciseIndex: number, value: string) => void;
  setTextField: (key: TextFieldKey, value: string) => void;
  updateSetField: (
    exerciseIndex: number,
    setIndex: number,
    key: 'reps' | 'weightKg',
    value: string,
  ) => void;
};

export type ManualWorkoutFormStore = ManualWorkoutFormDraftSlice;

const createManualWorkoutFormDraftSlice: StateCreator<
  ManualWorkoutFormStore,
  [],
  [],
  ManualWorkoutFormDraftSlice
> = (set) => ({
  addSet: (exerciseIndex) => {
    set((state) => ({
      form: {
        ...state.form,
        strengthExercises: state.form.strengthExercises.map(
          (exercise, index) =>
            index === exerciseIndex
              ? recalculateManualStrengthExercise({
                  ...exercise,
                  sets: [...exercise.sets, createEmptyManualWorkoutSet()],
                })
              : exercise,
        ),
      },
    }));
  },
  addStrengthExercise: () => {
    set((state) => ({
      form: {
        ...state.form,
        strengthExercises: [
          ...state.form.strengthExercises,
          createEmptyManualStrengthExercise(),
        ],
      },
    }));
  },
  form: createManualWorkoutFormState(),
  hydrateFromRecord: (record) => {
    set({
      form: createManualWorkoutFormStateFromRecord(record),
    });
  },
  removeSet: (exerciseIndex, setIndex) => {
    set((state) => ({
      form: {
        ...state.form,
        strengthExercises: state.form.strengthExercises.map(
          (exercise, index) =>
            index === exerciseIndex
              ? recalculateManualStrengthExercise({
                  ...exercise,
                  sets:
                    exercise.sets.length > 1
                      ? exercise.sets.filter(
                          (_, currentSetIndex) => currentSetIndex !== setIndex,
                        )
                      : exercise.sets,
                })
              : exercise,
        ),
      },
    }));
  },
  removeStrengthExercise: (exerciseIndex) => {
    set((state) => ({
      form: {
        ...state.form,
        strengthExercises:
          state.form.strengthExercises.length > 1
            ? state.form.strengthExercises.filter(
                (_, index) => index !== exerciseIndex,
              )
            : state.form.strengthExercises,
      },
    }));
  },
  resetForCreate: () => {
    set({
      form: createManualWorkoutFormState(),
    });
  },
  setPerformedOn: (performedOn) => {
    set((state) => ({
      form: {
        ...state.form,
        performedOn,
      },
    }));
  },
  setBodyCompositionField: (key, value) => {
    set((state) => ({
      form: {
        ...state.form,
        [key]: value,
      },
    }));
  },
  setCardioField: (key, value) => {
    set((state) => ({
      form: {
        ...state.form,
        [key]: value,
      },
    }));
  },
  setMeal: (mealIndex, value) => {
    set((state) => ({
      form: {
        ...state.form,
        meals: state.form.meals.map((meal, index) =>
          index === mealIndex ? value : meal,
        ),
      },
    }));
  },
  setStrengthExerciseName: (exerciseIndex, value) => {
    set((state) => ({
      form: {
        ...state.form,
        strengthExercises: state.form.strengthExercises.map(
          (exercise, index) =>
            index === exerciseIndex ? { ...exercise, name: value } : exercise,
        ),
      },
    }));
  },
  setStrengthExerciseRestTime: (exerciseIndex, value) => {
    set((state) => ({
      form: {
        ...state.form,
        strengthExercises: state.form.strengthExercises.map(
          (exercise, index) =>
            index === exerciseIndex
              ? { ...exercise, restTime: value }
              : exercise,
        ),
      },
    }));
  },
  setStrengthExerciseRir: (exerciseIndex, value) => {
    set((state) => ({
      form: {
        ...state.form,
        strengthExercises: state.form.strengthExercises.map(
          (exercise, index) =>
            index === exerciseIndex ? { ...exercise, rir: value } : exercise,
        ),
      },
    }));
  },
  setTextField: (key, value) => {
    set((state) => ({
      form: {
        ...state.form,
        [key]: value,
      },
    }));
  },
  updateSetField: (exerciseIndex, setIndex, key, value) => {
    set((state) => ({
      form: {
        ...state.form,
        strengthExercises: state.form.strengthExercises.map(
          (exercise, index) =>
            index === exerciseIndex
              ? recalculateManualStrengthExercise({
                  ...exercise,
                  sets: exercise.sets.map((set, currentSetIndex) =>
                    currentSetIndex === setIndex
                      ? { ...set, [key]: value }
                      : set,
                  ),
                })
              : exercise,
        ),
      },
    }));
  },
});

export const useManualWorkoutFormStore = create<ManualWorkoutFormStore>()(
  (...args) => ({
    ...createManualWorkoutFormDraftSlice(...args),
  }),
);
