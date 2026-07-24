import { type StateCreator, create } from 'zustand';
import type { WorkoutReportTab } from '../components/report-format';

export type WorkoutReportTabSlice = {
  activeTab: WorkoutReportTab;
  resetActiveTab: () => void;
  setActiveTab: (tab: WorkoutReportTab) => void;
};

export type WorkoutReportStore = WorkoutReportTabSlice;

const DEFAULT_TAB: WorkoutReportTab = 'volume';

const createWorkoutReportTabSlice: StateCreator<
  WorkoutReportStore,
  [],
  [],
  WorkoutReportTabSlice
> = (set) => ({
  activeTab: DEFAULT_TAB,
  resetActiveTab: () => {
    set({ activeTab: DEFAULT_TAB });
  },
  setActiveTab: (activeTab) => {
    set({ activeTab });
  },
});

export const useWorkoutReportStore = create<WorkoutReportStore>()(
  (...args) => ({
    ...createWorkoutReportTabSlice(...args),
  }),
);
