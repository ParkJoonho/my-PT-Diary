import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { AnalysisRecordsService } from '../analysis-records/analysis-records.service';
import { AnalysisRecordType } from '../analysis-records/dto/analysis-record-response.dto';
import { BodyComparisonAiClientPort } from './body-comparison-ai-client.port';
import { BodyComparisonResponseDto } from './dto/body-comparison-response.dto';
import { CreateBodyComparisonDto } from './dto/create-body-comparison.dto';
import {
  BodyComparisonOutput,
  bodyComparisonResultSchema,
} from './body-comparison.schemas';

@Injectable()
export class BodyComparisonService {
  private readonly logger = new Logger(BodyComparisonService.name);

  constructor(
    private readonly bodyComparisonAiClient: BodyComparisonAiClientPort,
    private readonly analysisRecordsService: AnalysisRecordsService,
  ) {}

  async analyzeBodyComparison(
    userKey: string,
    dto: CreateBodyComparisonDto,
  ): Promise<BodyComparisonResponseDto> {
    const content = await this.bodyComparisonAiClient.analyzeBodyComparison({
      afterImageBase64: dto.afterImageBase64,
      beforeImageBase64: dto.beforeImageBase64,
      height: dto.height,
      notes: dto.notes,
    });

    const parsed = this.safeParseJson(content);
    const validated = bodyComparisonResultSchema.safeParse(parsed);

    if (!validated.success) {
      throw new BadGatewayException({
        issues: validated.error.issues.map((issue) => ({
          code: issue.code,
          message: issue.message,
          path: issue.path.join('.'),
        })),
        message: '전·후 비교 분석 응답 형식이 올바르지 않아요.',
      });
    }

    const comparison = validated.data;
    const analyzedAt = new Date().toISOString();

    try {
      const savedRecord = await this.analysisRecordsService.createAnalysisRecord(
        userKey,
        {
          analyzedAt,
          analysisType: AnalysisRecordType.BodyComparison,
          qualitativeData: this.buildQualitativeData(comparison),
          quantitativeData: this.buildQuantitativeData(comparison),
          rawResult: comparison,
        },
      );

      return {
        analyzedAt,
        comparison,
        recordSave: {
          recordId: savedRecord.id,
          status: 'saved',
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown save error';

      this.logger.error(
        `Body comparison result was generated but record saving failed for userKey=${userKey}: ${message}`,
      );

      return {
        analyzedAt,
        comparison,
        recordSave: {
          message:
            '전·후 비교 분석 결과는 생성됐지만 이력 저장에는 실패했어요. 다시 시도해 주세요.',
          status: 'failed',
        },
      };
    }
  }

  private buildQualitativeData(comparison: BodyComparisonOutput) {
    return {
      grade: comparison.overallChange.grade,
      summary: comparison.overallChange.summary,
    };
  }

  private buildQuantitativeData(comparison: BodyComparisonOutput) {
    return {
      score: comparison.overallChange.score,
    };
  }

  private safeParseJson(content: string): unknown {
    let cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new BadGatewayException(
          '전·후 비교 분석 응답에서 JSON을 찾지 못했어요.',
        );
      }

      cleaned = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');

      try {
        return JSON.parse(cleaned);
      } catch {
        throw new BadGatewayException(
          '전·후 비교 분석 응답 JSON 파싱에 실패했어요.',
        );
      }
    }
  }
}
