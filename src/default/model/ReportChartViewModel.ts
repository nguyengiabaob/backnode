export interface ReportChartViewModel {
  projectName: string;
  name: string;
  userID: string;
  total: number;
  quantity: number;
  value: number;
  projectProgress: number;
  projectId: number | null;
  userWorkflowId: string;
  useForChild: string;
}
export interface GeneralReportViewModel {
  topChart: ReportChartViewModel[];
  pieChart: ReportChartViewModel[];
}
