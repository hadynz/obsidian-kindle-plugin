import { AuthorsTemplateVariables, authorsTemplateVariables } from './templateVariables';

describe('authorsTemplateVariables', () => {
  it('Breaks one author correctly', () => {
    const variables = authorsTemplateVariables('Michael Port');
    expect(variables).toEqual<AuthorsTemplateVariables>({
      author: 'Michael Port',
      authorsLastNames: 'Port',
      firstAuthorFirstName: 'Michael',
      firstAuthorLastName: 'Port',
      secondAuthorFirstName: undefined,
      secondAuthorLastName: undefined,
    });
  });

  it('Breaks two authors correctly', () => {
    const variables = authorsTemplateVariables('Robert Kegan and Lisa Laskow Lahey');
    expect(variables).toEqual<AuthorsTemplateVariables>({
      author: 'Robert Kegan and Lisa Laskow Lahey',
      authorsLastNames: 'Kegan-Lahey',
      firstAuthorFirstName: 'Robert',
      firstAuthorLastName: 'Kegan',
      secondAuthorFirstName: 'Lisa',
      secondAuthorLastName: 'Lahey',
    });
  });

  it('Breaks three authors correctly', () => {
    const variables = authorsTemplateVariables(
      'Vicki Robin, Joe Dominguez, And Mr. Money Mustache'
    );
    expect(variables).toEqual<AuthorsTemplateVariables>({
      author: 'Vicki Robin, Joe Dominguez, And Mr. Money Mustache',
      authorsLastNames: 'Robin_et_al',
      firstAuthorFirstName: 'Vicki',
      firstAuthorLastName: 'Robin',
      secondAuthorFirstName: 'Joe',
      secondAuthorLastName: 'Dominguez',
    });
  });
});
