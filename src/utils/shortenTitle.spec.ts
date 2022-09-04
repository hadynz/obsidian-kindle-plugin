import { shortenTitle } from '~/utils';

describe('Santize title for Obsidian environment', () => {
  it('strip book description in title after colon', () => {
    const santizedTitle = shortenTitle(
      'Book Yourself Solid: The Fastest, Easiest, and Most Reliable System for Getting More Clients Than You Can Handle Even if You Hate Marketing and Selling'
    );
    expect(santizedTitle).toEqual('Book Yourself Solid');
  });

  it('strips text after the last colon when multiple exist', () => {
    const santizedTitle = shortenTitle('Summary: Sapiens: A Brief History of Humankind');
    expect(santizedTitle).toEqual('Summary: Sapiens');
  });

  it('remove reserved characters — single quote', () => {
    const santizedTitle = shortenTitle(
      "The Manager's Path: A Guide for Tech Leaders Navigating Growth and Change"
    );
    expect(santizedTitle).toEqual('The Managers Path');
  });

  it('remove reserved characters — single quote with other special characters', () => {
    const santizedTitle = shortenTitle(
      'Rich Dad Poor Dad: What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not!'
    );
    expect(santizedTitle).toEqual('Rich Dad Poor Dad');
  });

  it('remove any title content inside brackets', () => {
    const santizedTitle = shortenTitle(
      'The Discipline of Teams (Harvard Business Review Classics)'
    );
    expect(santizedTitle).toEqual('The Discipline of Teams');
  });

  it('trims any leading or trailing spaces', () => {
    const santizedTitle = shortenTitle(' The Warm-Hearted Snowman ');
    expect(santizedTitle).toEqual('The Warm-Hearted Snowman');
  });

  it('replace [] with ()', () => {
    const santizedTitle = shortenTitle('Ricochet Joe [Kindle in Motion]');
    expect(santizedTitle).toEqual('Ricochet Joe (Kindle in Motion)');
  });
});
