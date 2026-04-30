import { ApiProperty } from '@nestjs/swagger';

export class ReportExtractPatientDto {
  @ApiProperty({ example: 'Mrs. Usha Chavan', nullable: true })
  name: string;

  @ApiProperty({ example: '65', nullable: true })
  age: string;

  @ApiProperty({ example: 'female', nullable: true })
  gender: string;

  @ApiProperty({ example: '04/02/2025', nullable: true })
  reportDate: string;

  @ApiProperty({ example: 'DR.MUKESH MAHAJAN', nullable: true })
  reference: string;

  @ApiProperty({ example: '04/02/2025', nullable: true })
  sampleCollectionDate: string;
}

export class ReportExtractFindingDto {
  @ApiProperty({ example: 'HIV I & II - Rapid/Tridot' })
  test: string;

  @ApiProperty({ example: 'Non-Reactive' })
  result: string;

  @ApiProperty({ example: 'normal', enum: ['normal', 'abnormal', 'unknown'] })
  status: 'normal' | 'abnormal' | 'unknown';

  @ApiProperty({ example: 'Screening test result is within the expected range', nullable: true })
  notes: string;
}

export class ReportExtractSummaryDto {
  @ApiProperty({ type: ReportExtractPatientDto })
  patient: ReportExtractPatientDto;

  @ApiProperty({
    example:
      'This report screens for HIV I & II antibodies and HBsAg. All reported screening results are non-reactive.',
  })
  overview: string;

  @ApiProperty({ type: [ReportExtractFindingDto] })
  keyFindings: ReportExtractFindingDto[];

  @ApiProperty({
    type: [String],
    example: ['HIV 1 and 2: Non-Reactive', 'Australia Antigen (HBsAg): Non-Reactive'],
  })
  normalValues: string[];

  @ApiProperty({
    type: [String],
    example: ['None. All reported screening test results are non-reactive.'],
  })
  abnormalValues: string[];

  @ApiProperty({
    type: [String],
    example: ['Please correlate with the clinical condition and confirm results when needed.'],
  })
  recommendations: string[];

  @ApiProperty({
    example:
      'This summary is based on extracted report text and should be reviewed by a qualified clinician.',
    nullable: true,
  })
  disclaimer: string;

  @ApiProperty({
    example:
      '## Report Summary\n\n### Patient\n- Name: Mrs. Usha Chavan\n- Age: 65\n- Gender: Female',
  })
  markdown: string;
}

export class ReportExtractResponseDto {
  @ApiProperty({ example: 'Mrs._Usha_Chavan__04022025_054113_PM.pdf' })
  fileName: string;

  @ApiProperty({ example: 2 })
  pages: number;

  @ApiProperty({ example: 2674 })
  extractedCharacters: number;

  @ApiProperty({
    example:
      'MRS. USHA CHAVAN Ref. By Patient Name 65 Female Years Age/Gender ...',
  })
  extractedTextPreview: string;

  @ApiProperty({ type: ReportExtractSummaryDto })
  reportSummary: ReportExtractSummaryDto;

  @ApiProperty({
    example:
      '## Report Summary\n\n### Patient\n- Name: Mrs. Usha Chavan\n- Age: 65\n- Gender: Female',
  })
  aiSummary: string;
}
