import { type StateCreator, create } from 'zustand';
import {
  type DateRange,
  WORKOUT_RECORD_PAGE_SIZE,
} from '../lib/workout-record-list-metadata';

export type WorkoutRecordListFilterSlice = {
  applyDateRange: (range: DateRange) => void;
  clearDateRange: () => void;
  closeCalendar: () => void;
  dateRange: DateRange;
  isCalendarOpen: boolean;
  openCalendar: () => void;
};

export type WorkoutRecordListPaginationSlice = {
  displayCount: number;
  expandDisplayCount: (totalCount: number) => void;
  resetDisplayCount: () => void;
};

export type WorkoutRecordListStore = WorkoutRecordListFilterSlice &
  WorkoutRecordListPaginationSlice;

const createWorkoutRecordListFilterSlice: StateCreator<
  WorkoutRecordListStore,
  [],
  [],
  WorkoutRecordListFilterSlice
> = (set) => ({
  applyDateRange: (dateRange) => {
    set({
      dateRange,
      displayCount: WORKOUT_RECORD_PAGE_SIZE,
      isCalendarOpen: false,
    });
  },
  clearDateRange: () => {
    set({
      dateRange: {
        end: null,
        start: null,
      },
      displayCount: WORKOUT_RECORD_PAGE_SIZE,
      isCalendarOpen: false,
    });
  },
  closeCalendar: () => {
    set({ isCalendarOpen: false });
  },
  dateRange: {
    end: null,
    start: null,
  },
  isCalendarOpen: false,
  openCalendar: () => {
    set({ isCalendarOpen: true });
  },
});

const createWorkoutRecordListPaginationSlice: StateCreator<
  WorkoutRecordListStore,
  [],
  [],
  WorkoutRecordListPaginationSlice
> = (set) => ({
  displayCount: WORKOUT_RECORD_PAGE_SIZE,
  expandDisplayCount: (totalCount) => {
    set((state) => ({
      displayCount: Math.min(
        state.displayCount + WORKOUT_RECORD_PAGE_SIZE,
        totalCount,
      ),
    }));
  },
  resetDisplayCount: () => {
    set({ displayCount: WORKOUT_RECORD_PAGE_SIZE });
  },
});

export const useWorkoutRecordListStore = create<WorkoutRecordListStore>()(
  (...args) => ({
    ...createWorkoutRecordListFilterSlice(...args),
    ...createWorkoutRecordListPaginationSlice(...args),
  }),
);
