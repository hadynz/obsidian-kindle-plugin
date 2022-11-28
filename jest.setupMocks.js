// Mock non-existent external dependencies
jest.mock(
  'obsidian',
  () => ({
    __esModule: true,
    default: () => jest.fn(),
  }),
  { virtual: true }
);
