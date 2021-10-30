import nunjucks from 'nunjucks';

function TrimAllEmptyLinesExtension(): void {
  this.tags = ['trim'];

  this.parse = function (parser, nodes) {
    const tok = parser.nextToken(); // Get the tag token

    // Parse the args and move after the block end.
    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(tok.value);

    // Parse the body
    const body = parser.parseUntilBlocks('trim', 'endtrim');
    parser.advanceAfterBlockEnd();

    // Actually do work on block body and arguments
    return new nodes.CallExtension(this, 'run', args, [body]);
  };

  this.run = function (_context, bodyCallback) {
    const rawCode: string = bodyCallback();
    const rawCodeNoLines = rawCode.replace(/(^[ \t]*\n)/gm, '').trim();
    return new nunjucks.runtime.SafeString(rawCodeNoLines);
  };
}

export { TrimAllEmptyLinesExtension };
