import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency with proper formatting
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Truncate text with ellipsis if it exceeds the character limit
 */
export function truncateText(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '...';
}

/**
 * Format a weight in grams to a readable format
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toLocaleString('en-IN', { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 2 
    })} kg`;
  }
  
  return `${grams.toLocaleString('en-IN', { 
    maximumFractionDigits: 2,
    minimumFractionDigits: 2 
  })} g`;
}
