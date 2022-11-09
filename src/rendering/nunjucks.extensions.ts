/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import nunjucks from 'nunjucks';

import { sb } from '~/utils';

import { HighlightIdBlockRefPrefix } from './renderer';

type SubClass = {
  children?: SubClassValue[];
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

/**
 * Recursively iterates through AST of a user template and find the value
 * of every node. This is made complex by the fact that some AST nodes
 * do not have values (e.g. if statement, nested blocks)
 * @param subclass
 * @returns
 */
const getRecursiveValue = (subclass: SubClass): string => {
  const firstChild = subclass.children?.[0];

  if (firstChild == null) {
    return null;
  }

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

    // Parse the name of the "needle" or template variable name that we will search for (e.g. "text" in `{% blockref "text", "id" %}`)
    const needle = args.children[0].value;

    // Find line number of where our needle is located in template
    const needleSubclass = body.children.find((c) => getRecursiveValue(c) === needle);

    this.lineNumber = needleSubclass?.lineno;

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

    // `lineNumber` can be undefined if highlight text ({{text}}) is not used in template
    if (this.lineNumber == null) {
      return renderedTemplate;
    }

    const buffer = sb(renderedTemplate);

    const blockRef = `${HighlightIdBlockRefPrefix}${context.ctx[highlightId]}`;
    const blockRefSuffixLine = `${buffer.getLine(this.lineNumber + 1)} ${blockRef}`;

    buffer.replace({ line: this.lineNumber, content: blockRefSuffixLine });
    return new nunjucks.runtime.SafeString(buffer.toString());
  };
}

export { BlockReferenceExtension, TrimAllEmptyLinesExtension };
