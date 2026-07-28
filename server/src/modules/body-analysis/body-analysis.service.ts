import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { AnalysisRecordsService } from '../analysis-records/analysis-records.service';
import { AnalysisRecordType } from '../analysis-records/dto/analysis-record-response.dto';
import { CreateBodyAnalysisDto } from './dto/create-body-analysis.dto';
import { BodyAnalysisResponseDto } from './dto/body-analysis-response.dto';
import { BodyAnalysisAiClientPort } from './body-analysis-ai-client.port';
import {
  BodyAnalysisOutput,
  bodyAnalysisResultSchema,
} from './body-analysis.schemas';
import { BodyAnalysisRepositoryPort } from './body-analysis.repository.port';

@Injectable()
export class BodyAnalysisService {
  private readonly logger = new Logger(BodyAnalysisService.name);

  constructor(
    private readonly bodyAnalysisAiClient: BodyAnalysisAiClientPort,
    private readonly bodyAnalysisRepository: BodyAnalysisRepositoryPort,
    private readonly analysisRecordsService: AnalysisRecordsService,
  ) {}

  async analyzeBody(
    userKey: string,
    dto: CreateBodyAnalysisDto,
  ): Promise<BodyAnalysisResponseDto> {
    const recentWorkoutContext =
      await this.bodyAnalysisRepository.listRecentWorkoutContext({
        limit: 20,
        userKey,
      });

    const content = await this.bodyAnalysisAiClient.analyzeBody({
      backImageBase64: dto.backImageBase64,
      height: dto.height,
      imageBase64: dto.imageBase64,
      medicalSymptoms: dto.medicalSymptoms,
      photoDate: dto.photoDate,
      recentWorkoutContext: recentWorkoutContext.map((record) => ({
        bodyComposition: record.body_composition,
        completedAt: record.completed_at,
        completedOn: record.completed_on,
        durationSeconds: record.duration_seconds,
        routineLabel: record.routine_label,
        source: record.source,
        summary: record.summary,
        title: record.title,
      })),
      sideImageBase64: dto.sideImageBase64,
      squatImageBase64: dto.squatImageBase64,
    });

    const parsed = this.safeParseJson(content);
    const validated = bodyAnalysisResultSchema.safeParse(parsed);

    if (!validated.success) {
      throw new BadGatewayException({
        issues: validated.error.issues.map((issue) => ({
          code: issue.code,
          message: issue.message,
          path: issue.path.join('.'),
        })),
        message: '체형 분석 응답 형식이 올바르지 않아요.',
      });
    }

    const analysis = validated.data;
    const analyzedAt = new Date().toISOString();

    try {
      const savedRecord = await this.analysisRecordsService.createAnalysisRecord(
        userKey,
        {
          analyzedAt,
          analysisType: AnalysisRecordType.Body,
          qualitativeData: this.buildQualitativeData(analysis),
          quantitativeData: this.buildQuantitativeData(analysis),
          rawResult: analysis,
        },
      );

      return {
        analysis,
        analyzedAt,
        recordSave: {
          recordId: savedRecord.id,
          status: 'saved',
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown save error';

      this.logger.error(
        `Body analysis result was generated but record saving failed for userKey=${userKey}: ${message}`,
      );

      return {
        analysis,
        analyzedAt,
        recordSave: {
          message:
            '체형 분석 결과는 생성됐지만 이력 저장에는 실패했어요. 다시 시도해 주세요.',
          status: 'failed',
        },
      };
    }
  }

  private buildQualitativeData(analysis: BodyAnalysisOutput) {
    return {
      bodyType: analysis.bodyType,
      bodyTypeDescription: analysis.bodyTypeDescription,
      summary: analysis.summary,
    };
  }

  private buildQuantitativeData(analysis: BodyAnalysisOutput) {
    return {
      armToHeight: analysis.ratios.armToHeight,
      hipBalance: analysis.posture.hipBalance.score,
      overallAlignment: analysis.posture.overallAlignment.score,
      shoulderBalance: analysis.posture.shoulderBalance.score,
      spinalCurvature: analysis.posture.spinalCurvature.score,
      upperToLower: analysis.ratios.upperToLower,
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
        throw new BadGatewayException('체형 분석 응답에서 JSON을 찾지 못했어요.');
      }

      cleaned = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');

      try {
        return JSON.parse(cleaned);
      } catch {
        throw new BadGatewayException('체형 분석 응답 JSON 파싱에 실패했어요.');
      }
    }
  }
}
