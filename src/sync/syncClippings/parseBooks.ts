import { Book, groupToBooks, readMyClippingsFile } from '@hadynz/kindle-clippings';
import fs from 'fs';

import type { BookHighlight, Highlight } from '~/models';
import { hash } from '~/utils';

const MONTH_MAP: Record<number, string> = {
  1: 'January', 2: 'February', 3: 'March', 4: 'April',
  5: 'May', 6: 'June', 7: 'July', 8: 'August',
  9: 'September', 10: 'October', 11: 'November', 12: 'December',
};

const WEEKDAY_MAP: Record<string, string> = {
  '一': 'Monday', '二': 'Tuesday', '三': 'Wednesday',
  '四': 'Thursday', '五': 'Friday', '六': 'Saturday',
  '日': 'Sunday', '天': 'Sunday',
};

const PERIOD_MAP: Record<string, string> = {
  '上午': 'AM', '下午': 'PM',
};

/**
 * Convert Chinese date/time strings in Kindle clippings to English format.
 *
 * Supported inputs:
 *   - 2022年12月17日星期六 下午5:11:41  → Saturday, December 17, 2022 5:11:41 PM
 *   - 2021年8月28日 上午1:47:38         → August 28, 2021 1:47:38 AM
 *   - 2024年12月31日 星期二             → Tuesday, December 31, 2024
 *   - 2024年1月1日                      → January 1, 2024
 */
export const convertChineseDateToEnglish = (content: string): string => {
  // Regex breakdown:
  //   (\d{4})年(\d{1,2})月(\d{1,2})日  — date part (required)
  //   \s*(?:(?:星期|周)([一二三四五六日天]))?  — weekday (optional)
  //   \s*(?:(上午|下午)(\d{1,2}):(\d{2}):(\d{2}))?  — time with AM/PM (optional)
  const chineseDateRegex =
    /(\d{4})年(\d{1,2})月(\d{1,2})日\s*(?:(?:星期|周)([一二三四五六日天]))?\s*(?:(上午|下午)(\d{1,2}):(\d{2}):(\d{2}))?/g;

  return content.replace(
    chineseDateRegex,
    (
      match: string,
      year: string,
      month: string,
      day: string,
      weekday: string | undefined,
      period: string | undefined,
      hour: string | undefined,
      minute: string | undefined,
      second: string | undefined
    ) => {
      const monthNum = Number(month);
      const monthName = MONTH_MAP[monthNum];

    if (!monthName) {
        return match;
    }
      const datePart = `${monthName} ${Number(day)}, ${year}`;

      let result = '';

      if (weekday) {
        result = `${WEEKDAY_MAP[weekday]}, ${datePart}`;
      } else {
        result = datePart;
      }

      if (period && hour && minute && second) {
        result += ` ${Number(hour)}:${minute}:${second} ${PERIOD_MAP[period]}`;
    }

      return result;
    }
  );
};

const toBookHighlight = (book: Book): BookHighlight => {
  return {
    book: {
      id: hash(book.title),
      title: book.title,
      author: book.author,
    },
    highlights: book.annotations
      .filter((entry) => entry.type === 'HIGHLIGHT' || entry.type === 'UNKNOWN')
      .map(
        (entry): Highlight => ({
          id: hash(entry.content),
          text: entry.content,
          note: entry.note,
          location: entry.location?.display,
          page: entry.page?.display,
          createdDate: entry.createdDate,
        })
      ),
  };
};

export const parseBooks = (file: string): BookHighlight[] => {
  let clippingsFileContent = fs.readFileSync(file, 'utf8');
  clippingsFileContent = convertChineseDateToEnglish(clippingsFileContent);

  const parsedRows = readMyClippingsFile(clippingsFileContent);
  const books = groupToBooks(parsedRows);

  return books.map(toBookHighlight);
};
