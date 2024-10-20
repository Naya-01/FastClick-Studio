import { Pair } from '../models/pair';

export const lespairs = [
  new Pair('FromDevice@1', 'Print@2'),
  new Pair('FromDevice@1', 'Host@6'),
  new Pair('FromDevice@1', 'Discard@4'),
  new Pair('Print@2', 'ToIPSummaryDump@3'),
  new Pair('ToIPSummaryDump@3', 'ToIPSummaryDumpLongLabel@3'),
  new Pair('ToIPSummaryDumpLongLabel@3', 'Discard@4'),
];
