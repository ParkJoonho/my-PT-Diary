import type { ConditionRecordDto } from 'shared/api/generated/models';
import { create, type StateCreator } from 'zustand';
import {
  CONDITION_LABELS,
  MUSCLE_SORENESS_LABELS,
  cloneConditionItems,
  createConditionItems,
} from '../lib/condition-record-metadata';

export type ConditionFormState = {
  conditions: ReturnType<typeof createConditionItems>;
  date: string;
  muscleSoreness: ReturnType<typeof createConditionItems>;
  weekNumberInput: string;
};

export type ConditionFormDraftSlice = {
  form: ConditionFormState;
  hydrateFromRecord: (record: ConditionRecordDto) => void;
  resetForCreate: (date: string) => void;
  setDate: (date: string) => void;
  setWeekNumberInput: (value: string) => void;
  toggleConditionScore: (index: number, score: number) => void;
  toggleMuscleSorenessScore: (index: number, score: number) => void;
};

export type ConditionFormTooltipSlice = {
  closeMuscleTooltip: () => void;
  muscleTooltipLabel: string | null;
  openMuscleTooltip: (label: string) => void;
};

export type ConditionFormStore = ConditionFormDraftSlice &
  ConditionFormTooltipSlice;

function createDraftState(date: string): ConditionFormState {
  return {
    conditions: createConditionItems(CONDITION_LABELS),
    date,
    muscleSoreness: createConditionItems(MUSCLE_SORENESS_LABELS),
    weekNumberInput: '1',
  };
}

const createConditionFormDraftSlice: StateCreator<
  ConditionFormStore,
  [],
  [],
  ConditionFormDraftSlice
> = (set) => ({
  form: createDraftState(''),
  hydrateFromRecord: (record) => {
    set({
      form: {
        conditions: cloneConditionItems(record.conditions),
        date: record.date,
        muscleSoreness: cloneConditionItems(record.muscleSoreness),
        weekNumberInput: String(record.weekNumber),
      },
    });
  },
  resetForCreate: (date) => {
    set({
      form: createDraftState(date),
    });
  },
  setDate: (date) => {
    set((state) => ({
      form: {
        ...state.form,
        date,
      },
    }));
  },
  setWeekNumberInput: (weekNumberInput) => {
    set((state) => ({
      form: {
        ...state.form,
        weekNumberInput,
      },
    }));
  },
  toggleConditionScore: (index, score) => {
    set((state) => ({
      form: {
        ...state.form,
        conditions: state.form.conditions.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                score: item.score === score ? 0 : score,
              }
            : item,
        ),
      },
    }));
  },
  toggleMuscleSorenessScore: (index, score) => {
    set((state) => ({
      form: {
        ...state.form,
        muscleSoreness: state.form.muscleSoreness.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                score: item.score === score ? 0 : score,
              }
            : item,
        ),
      },
    }));
  },
});

const createConditionFormTooltipSlice: StateCreator<
  ConditionFormStore,
  [],
  [],
  ConditionFormTooltipSlice
> = (set) => ({
  closeMuscleTooltip: () => {
    set({ muscleTooltipLabel: null });
  },
  muscleTooltipLabel: null,
  openMuscleTooltip: (label) => {
    set({ muscleTooltipLabel: label });
  },
});

export const useConditionFormStore = create<ConditionFormStore>()(
  (...args) => ({
    ...createConditionFormDraftSlice(...args),
    ...createConditionFormTooltipSlice(...args),
  }),
);
