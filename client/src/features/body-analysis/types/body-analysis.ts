export type BodyPartDetail = {
  note?: string;
  value?: string;
};

export type PostureDetail = {
  note?: string;
  score?: number;
};

export type SeverityDetail = {
  angle?: string;
  areas?: string[];
  detected?: boolean;
  heightDiff?: string;
  note?: string;
  severity?: string;
};

export type MobilityDetail = {
  note?: string;
  score?: number;
};

export type BodyAnalysisResult = {
  bodyType?: string;
  bodyTypeDescription?: string;
  lowerBody?: {
    hipWidth?: BodyPartDetail;
    kneeAlignment?: BodyPartDetail;
    legLength?: BodyPartDetail;
  };
  medicalAnalysis?: {
    bodyStructureImpact?: string;
    disclaimer?: string;
    exerciseWarnings?: Array<{
      alternative?: string;
      exercise?: string;
      reason?: string;
    }>;
    lifestyleAdvice?: string[];
    referralSuggestion?: string;
    rehabExercises?: Array<{
      description?: string;
      frequency?: string;
      name?: string;
      precaution?: string;
      targetArea?: string;
    }>;
    musculoskeletalRisks?: Array<{
      area?: string;
      description?: string;
      preventionTip?: string;
      riskLevel?: string;
    }>;
    symptomAssessment?: string;
  } | null;
  multiViewAnalysis?: {
    backView?: {
      muscleImbalance?: SeverityDetail;
      pelvicAsymmetry?: SeverityDetail;
      scapularWinging?: SeverityDetail;
      scoliosis?: SeverityDetail;
      shoulderAsymmetry?: SeverityDetail;
    } | null;
    compositeGrade?: string;
    compositePostureScore?: number;
    priorityCorrections?: Array<{
      description?: string;
      exercise?: string;
      issue?: string;
      priority?: string;
    }>;
    sideView?: {
      anteriorPelvicTilt?: SeverityDetail;
      forwardHeadPosture?: SeverityDetail;
      kneeHyperextension?: SeverityDetail;
      roundedShoulders?: SeverityDetail;
      spinalCurve?: {
        note?: string;
        type?: string;
      };
    } | null;
    squatView?: {
      ankleMobility?: MobilityDetail;
      balance?: MobilityDetail;
      hipMobility?: MobilityDetail;
      kneeValgus?: SeverityDetail;
      squatDepth?: {
        note?: string;
        value?: string;
      };
      trunkLean?: SeverityDetail;
    } | null;
    viewsAnalyzed?: string[];
  } | null;
  posture?: {
    hipBalance?: PostureDetail;
    overallAlignment?: PostureDetail;
    shoulderBalance?: PostureDetail;
    spinalCurvature?: PostureDetail;
  };
  prediction?: {
    currentEstimate?: string;
    milestones?: string[];
    oneYearPrediction?: string;
    riskFactors?: string[];
    sixMonthPrediction?: string;
    threeMonthPrediction?: string;
  } | null;
  ratios?: {
    armToHeight?: number;
    upperToLower?: number;
  };
  recommendations?: string[];
  summary?: string;
  upperBody?: {
    armLength?: BodyPartDetail;
    neckLength?: BodyPartDetail;
    shoulderWidth?: BodyPartDetail;
    spineAlignment?: BodyPartDetail;
  };
};

export type BodyComparisonResult = {
  bodyChanges?: {
    core?: {
      change?: string;
      description?: string;
      details?: string[];
    };
    lowerBody?: {
      change?: string;
      description?: string;
      details?: string[];
    };
    upperBody?: {
      change?: string;
      description?: string;
      details?: string[];
    };
  };
  bodyComposition?: {
    fatChange?: string;
    muscleChange?: string;
    proportionChange?: string;
  };
  motivationalMessage?: string;
  overallChange?: {
    grade?: string;
    score?: number;
    summary?: string;
  };
  postureChanges?: {
    improvements?: string[];
    overallPosture?: string;
    remaining?: string[];
  };
  recommendations?: {
    improve?: string[];
    keepDoing?: string[];
    nextGoal?: string;
  };
};

export type AnalysisRecordSummary = {
  analysisType: string;
  analyzedAt: string;
  createdAt: string;
  id: string;
  qualitativeData?: Record<string, unknown>;
  quantitativeData?: Record<string, unknown>;
};

export type AnalysisRecordDetail = AnalysisRecordSummary & {
  rawResult: Record<string, unknown>;
};

export type AnalysisRecordComparison = {
  bodyTypeChange?: {
    from?: string;
    note?: string;
    to?: string;
  };
  declines?: string[];
  improvements?: string[];
  motivationalNote?: string;
  overallChange?: string;
  postureChanges?: Array<{
    after?: number;
    area?: string;
    before?: number;
    change?: string;
    note?: string;
  }>;
  quantitativeChanges?: Array<{
    after?: string;
    before?: string;
    changePercent?: string;
    metric?: string;
  }>;
  recommendations?: string[];
};
