import fs from 'fs';
import { parse } from 'node-html-parser';

import { ee } from '~/eventEmitter';
import type { BookHighlight, Highlight } from '~/models';
import { hash } from '~/utils';



const toBookHighlight = (HTMLContent: string): BookHighlight => {
  const HTMLString = HTMLContent.toString();
    
  const root = parse(HTMLString);

  const bookAuthors = root.querySelector(".authors").text.toString().trim();
  const bookTitle = root.querySelector(".bookTitle").text;
  const noteHeadings = root.querySelectorAll(".noteHeading").map(elem => elem.text.trim());
  const noteText = root.querySelectorAll(".noteText").map(elem => elem.text.trim());

  if (noteHeadings.length !== noteText.length)
  {
    ee.emit('syncSessionFailure', 'Invalid HTML file (noteHeadings & noteText not of equal length)');
  }

  const highlights : Highlight[] = [];

  for (let i = 0; i < noteHeadings.length; i++)
  {
      const currHeading = noteHeadings[i];
      const currText = noteText[i];

      const highlightType = (/(.*) (\(|\-)/.exec(currHeading))[1].trim(); //Note | Highlight

      if (highlightType === 'Note')
      {
          highlights[highlights.length - 1].note = currText;
      }
      else // Highlight
      {
          //let highlightColor = currHeading.match(/.* \((.*)\)/)[1].trim(); 
          //maybe useful one day
          const highlightLocation = ((/.* >  Location (.*)/.exec(currHeading)) !== null) ? (/.* >  Location (.*)/.exec(currHeading))[1].trim() : null //123 todo test if contains
          const highlightPage = ((/.* >  Page (.*)/.exec(currHeading)) !== null) ? (/.* >  Page (.*)/.exec(currHeading))[1].trim() : null;
          
          const highlight : Highlight = 
          {
            id: hash(noteText[i]),
            text: noteText[i],
            note: null,
            location: highlightLocation,
            page: highlightPage || null,
            createdDate: null,
          }

          highlights.push(highlight);
      }
  }

  return {
    book: {
        id: hash(bookTitle),
        title: bookTitle,
        author: bookAuthors,
      },
    highlights: highlights,
  };
};

export const parseHTML = (file: string): BookHighlight[] => {
  const HTMLContent = fs.readFileSync(file, 'utf8');

  const book = toBookHighlight(HTMLContent);

  return [book];
};
