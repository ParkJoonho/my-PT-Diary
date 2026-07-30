import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import type { ConditionRecordDto } from 'shared/api/generated/models';
import {
  CONDITION_LABELS,
  MUSCLE_SORENESS_LABELS,
} from '../../lib/condition-record-metadata';
import { ConditionRecordCard } from '../condition-record-card';

jest.mock('shared/components/icons/pt-diary-icons', () => {
  const { Text: MockText } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    OriginalAppIcon: ({ name }: { name: string }) => (
      <MockText>{`icon:${name}`}</MockText>
    ),
  };
});

function createConditionRecord(): ConditionRecordDto {
  return {
    conditions: CONDITION_LABELS.map((label, index) => ({
      label,
      score: index === 0 ? 4 : index === 1 ? 3 : 0,
    })),
    createdAt: 1_753_318_400_000,
    date: '2026-07-24',
    id: 'condition-1',
    muscleSoreness: MUSCLE_SORENESS_LABELS.map((label, index) => ({
      label,
      score: index === 0 ? 3 : index === 1 ? 2 : 0,
    })),
    summary: {
      averageConditionScore: 3.5,
      averageSorenessScore: 2.5,
      selectedConditionCount: 2,
      selectedSorenessCount: 2,
      severeSorenessCount: 1,
    },
    weekNumber: 1,
  };
}

describe('컨디션 기록 카드', () => {
  it('평균 점수와 근육통 부위 요약을 보여준다', () => {
    render(<ConditionRecordCard record={createConditionRecord()} />);

    expect(screen.getByText('컨디션')).toBeTruthy();
    expect(screen.getByText('icon:personOutline')).toBeTruthy();
    expect(screen.getByText('icon:walkOutline')).toBeTruthy();
    expect(screen.getByText('icon:armFlexOutline')).toBeTruthy();
    expect(screen.getByText('3.5')).toBeTruthy();
    expect(screen.getByText('보통')).toBeTruthy();
    expect(screen.getByText('2.5')).toBeTruthy();
    expect(screen.getByText('중간')).toBeTruthy();
    expect(screen.getByText('가슴 +1')).toBeTruthy();
  });
});
