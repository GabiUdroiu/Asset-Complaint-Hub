import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {
  transform(date: string | Date | number[] | null | undefined): string {
    if (!date) return '';

    // Handle array format (from backend sometimes)
    if (Array.isArray(date)) {
      const [year, month, day, hour = 0, minute = 0] = date;
      return new Date(year, month - 1, day, hour, minute).toLocaleDateString(
        'en-US',
        { year: 'numeric', month: '2-digit', day: '2-digit' }
      );
    }

    // Handle Date and string formats
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
