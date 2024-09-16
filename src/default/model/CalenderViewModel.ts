/* eslint-disable prettier/prettier */
import { WorkInfViewModel } from "./WorkInfoViewModel";

export interface CalendarViewModel {
  date: string | null;
  events: WorkInfViewModel[];
}