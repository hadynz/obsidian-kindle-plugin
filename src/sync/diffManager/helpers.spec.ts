import faker from 'faker';

import type { Highlight } from '~/models';

import type { RenderedHighlight } from './';
import { diffLists } from './helpers';

describe('diffLists', () => {
  it('Returns no results when both lists are empty', () => {
    const results = diffLists([], []);
    expect(results).toHaveLength(0);
  });

  it('New highlight that has never been rendered is flagged in diff result', () => {
    const remotes: Highlight[] = [
      {
        id: faker.random.alphaNumeric(4),
        text: 'highlighted text',
      },
    ];

    const results = diffLists(remotes, []);
    expect(results).toHaveLength(1);
    expect(results[0].highlight).toEqual(remotes[0]);
    expect(results[0].successorSibling).toBeNull();
  });

  it("Existing highlight that has been rendered doesn't show in diff result", () => {
    const highlightId = faker.random.alphaNumeric(4);

    const remotes: Highlight[] = [
      {
        id: highlightId,
        text: 'highlighted text',
      },
    ];

    const renders: RenderedHighlight[] = [
      {
        line: faker.datatype.number(),
        highlightId,
        text: faker.lorem.sentence(),
        type: 'clipping',
      },
    ];

    const results = diffLists(remotes, renders);
    expect(results).toHaveLength(0);
  });

  it('Rendered sibling highlights are correctly flagged for new highlights - before & after', () => {
    const remotes: Highlight[] = [
      {
        id: 'A',
        text: 'highlighted text',
      },
      {
        id: 'B',
        text: 'highlighted text',
      },
      {
        id: 'C',
        text: 'highlighted text',
      },
      {
        id: 'D',
        text: 'highlighted text',
      },
      {
        id: 'E',
        text: 'highlighted text',
      },
      {
        id: 'F',
        text: 'highlighted text',
      },
    ];

    const renders: RenderedHighlight[] = [
      {
        line: 2,
        highlightId: 'B',
        text: faker.lorem.sentence(),
        type: 'clipping',
      },
      {
        line: 3,
        highlightId: 'E',
        text: faker.lorem.sentence(),
        type: 'clipping',
      },
    ];

    const results = diffLists(remotes, renders);
    expect(results).toHaveLength(4);

    expect(results[0].highlight.id).toEqual('A');
    expect(results[0].successorSibling.highlightId).toEqual('B');

    expect(results[1].highlight.id).toEqual('C');
    expect(results[1].successorSibling.highlightId).toEqual('E');

    expect(results[2].highlight.id).toEqual('D');
    expect(results[2].successorSibling.highlightId).toEqual('E');

    expect(results[3].highlight.id).toEqual('F');
    expect(results[3].successorSibling).toBeNull();
  });
});
