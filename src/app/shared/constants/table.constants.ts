export const CELL_CLASS = 'px-6 py-4 text-left text-text';
export const HEADER_CELL_CLASS = 'px-6 py-4 text-left text-sm font-semibold text-text';
export const ROW_CLASS =
  'bg-row-detail hover:bg-row-detail-hover border-b border-border transition-colors';
export const GROUP_ROW_CLASS =
  'bg-row-bg hover:bg-row-bg-hover border-b border-border cursor-pointer transition-colors';
export const CLOSE_CELL_CLASS =
  'w-20 text-center cursor-pointer [&_button]:cursor-pointer';

export const TABLE_CONSTANTS = {
  cellClass: CELL_CLASS,
  headerCellClass: HEADER_CELL_CLASS,
  rowClass: ROW_CLASS,
  groupRowClass: GROUP_ROW_CLASS,
  closeCellClass: CLOSE_CELL_CLASS,
} as const;
