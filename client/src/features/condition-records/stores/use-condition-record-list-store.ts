import { type StateCreator, create } from 'zustand';
import {
  CONDITION_PAGE_SIZE,
  type DateRange,
} from '../lib/condition-record-metadata';

export type ConditionRecordListFilterSlice = {
  applyDateRange: (range: DateRange) => void;
  clearDateRange: () => void;
  closeCalendar: () => void;
  dateRange: DateRange;
  isCalendarOpen: boolean;
  openCalendar: () => void;
};

export type ConditionRecordListPaginationSlice = {
  displayCount: number;
  expandDisplayCount: (totalCount: number) => void;
  resetDisplayCount: () => void;
};

export type ConditionRecordListStore = ConditionRecordListFilterSlice &
  ConditionRecordListPaginationSlice;

const createConditionRecordListFilterSlice: StateCreator<
  ConditionRecordListStore,
  [],
  [],
  ConditionRecordListFilterSlice
> = (set) => ({
  applyDateRange: (dateRange) => {
    set({
      dateRange,
      displayCount: CONDITION_PAGE_SIZE,
      isCalendarOpen: false,
    });
  },
  clearDateRange: () => {
    set({
      dateRange: {
        end: null,
        start: null,
      },
      displayCount: CONDITION_PAGE_SIZE,
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

const createConditionRecordListPaginationSlice: StateCreator<
  ConditionRecordListStore,
  [],
  [],
  ConditionRecordListPaginationSlice
> = (set) => ({
  displayCount: CONDITION_PAGE_SIZE,
  expandDisplayCount: (totalCount) => {
    set((state) => ({
      displayCount: Math.min(
        state.displayCount + CONDITION_PAGE_SIZE,
        totalCount,
      ),
    }));
  },
  resetDisplayCount: () => {
    set({ displayCount: CONDITION_PAGE_SIZE });
  },
});

export const useConditionRecordListStore = create<ConditionRecordListStore>()(
  (...args) => ({
    ...createConditionRecordListFilterSlice(...args),
    ...createConditionRecordListPaginationSlice(...args),
  }),
);
