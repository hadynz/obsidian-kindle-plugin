import type { BookHighlight } from '~/models';

const data: BookHighlight[] = [
  {
    book: {
      id: '1',
      title: 'Animal Farm (Classics To Go)',
      author: 'George Orwell',
    },
    highlights: [
      {
        id: '1-A',
        text: 'Our labour tills the soil, our dung fertilises it, and yet there is not one of us that owns more than his bare skin',
      },
      {
        id: '1-B',
        text: 'The pigs did not actually work, but directed and supervised the others. With their superior knowledge it was natural that they should assume the leadership',
      },
    ],
  },
  {
    book: {
      id: '2',
      title: 'An Everyone Culture',
      author: 'Robert Kegan and Lisa Laskow Lahey',
    },
    highlights: [
      {
        id: '2-A',
        text: 'research shows that the single biggest cause of work burnout is not work overload, but working too long without experiencing your own personal development',
      },
      {
        id: '2-B',
        text: 'Challenge existing processes Inspire a shared vision',
      },
      {
        id: '2-C',
        text: 'higher level of independence, self-reliance, self-trust, and the capacity to exercise initiative',
      },
    ],
  },
  {
    book: {
      id: '3',
      title: 'The Girl on the Train: A Novel',
      author: 'Paula Hawkins',
    },
    highlights: [
      {
        id: '3-A',
        text: 'I lived at number twenty-three Blenheim Road for five years, blissfully happy and utterly wretched',
      },
      {
        id: '3-B',
        text: 'Life is not a paragraph, and death is no parenthesis',
      },
      {
        id: '3-C',
        text: 'The street is clear—no sign of Tom or Anna—and the part of me that can’t resist a bit of drama is actually quite disappointed',
      },
      {
        id: '3-D',
        text: 'but failure cloaked me like a mantle, it overwhelmed me, dragged me under, and I gave up hope',
      },
    ],
  },
];

export default data;
