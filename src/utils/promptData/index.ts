
// This file re-exports all category data from individual files
import { subjects } from './subjects';
import { appearance } from './appearance';
import { composition } from './composition';
import { environment } from './environment';
import { style } from './style';
import { quality } from './quality';
import { examples } from './examples';
import { Category } from '@/types/prompt';

// Combine all category arrays
export const promptCategories: Category[] = [
  ...subjects,
  ...appearance,
  ...environment,
  ...style,
  ...composition,
  ...quality,
  ...examples
];
