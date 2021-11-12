import nunjucks from 'nunjucks';

import { HighlightIdBlockRefPrefix } from '~/renderer';
import { sb } from '~/utils';

type SubClass = {
  children: SubClassValue[];
  colno: number;
  lineno: number;
};

type SubClassValue = {
  args?: SubClass;
  name?: SubClassValue;
  colno: number;
  lineno: number;
  value: string;
};

type ParsedSignature = {
  children: SubClass[];
};

type Context = {
  ctx: Record<string, string>;
};

function TrimAllEmptyLinesExtension(): void {
  this.tags = ['trim'];

  this.parse = function (parser, nodes) {
    const tok = parser.nextToken(); // Get the tag token

    // Parse the args and move after the block end.
    const args: ParsedSignature = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(tok.value);

    // Parse the body
    const body: ParsedSignature = parser.parseUntilBlocks('trim', 'endtrim');
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

const getRecursiveValue = (subclass: SubClass): string => {
  const firstChild = subclass.children[0];
  return firstChild.args == null ? firstChild.value : getRecursiveValue(firstChild.args);
};

/**
 * // TODO: description goes here...
 * {% blockref "text", "id" %}
 *   ...
 * {% endblockref %}
 */
function BlockReferenceExtension(): void {
  this.tags = ['blockref'];

  this.parse = function (parser, nodes) {
    const tok = parser.nextToken(); // Get the tag token

    // Parse the args and move after the block end.
    const args: SubClass = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(tok.value);

    // Parse the body
    const body: ParsedSignature = parser.parseUntilBlocks('blockref', 'endblockref');
    parser.advanceAfterBlockEnd();

    // Find line number of argument 1 variable in template
    const needle = args.children[0].value;

    const needleSubclass = body.children.find((c) => getRecursiveValue(c) === needle);

    this.lineNumber = needleSubclass.lineno;

    // Actually do work on block body and arguments
    return new nodes.CallExtension(this, 'run', args, [body]);
  };

  this.run = function (
    context: Context,
    _needle: keyof Context['ctx'],
    highlightId: keyof Context['ctx'],
    bodyCallback: () => string
  ) {
    const renderedTemplate: string = bodyCallback();
    const buffer = sb(renderedTemplate);

    const blockRef = `${HighlightIdBlockRefPrefix}${context.ctx[highlightId]}`;
    const blockRefSuffixLine = `${buffer.getLine(this.lineNumber + 1)} ${blockRef}`;

    buffer.replace({ line: this.lineNumber, content: blockRefSuffixLine });
    return new nunjucks.runtime.SafeString(buffer.toString());
  };
}

export { BlockReferenceExtension, TrimAllEmptyLinesExtension };
