import type { ExprNode } from './ast'

export type NotNotation = 'prime' | 'overbar'

interface PrintOptions {
  notNotation?: NotNotation
}

/**
 * Print a Boolean expression as a string.
 * NOT is printed as A' (prime) by default.
 * For overbar mode, the UI uses the AST directly to render HTML spans.
 */
export function printExpr(node: ExprNode, opts: PrintOptions = {}, precedence = 0): string {
  const { notNotation = 'prime' } = opts

  switch (node.kind) {
    case 'var':   return node.name
    case 'const': return String(node.value)

    case 'not': {
      const inner = printExpr(node.child, opts, 10)
      if (notNotation === 'prime') {
        // If child is a variable or const, no parens needed
        if (node.child.kind === 'var' || node.child.kind === 'const') {
          return `${inner}'`
        }
        return `(${inner})'`
      }
      // overbar: the UI wraps in a span; here we use a unicode overline as a fallback
      return `̅${inner}`
    }

    case 'and': {
      const parts = node.children.map(c => printExpr(c, opts, 3))
      const joined = parts.join('·')
      return precedence > 3 ? `(${joined})` : joined
    }

    case 'or': {
      const parts = node.children.map(c => printExpr(c, opts, 2))
      const joined = parts.join(' + ')
      return precedence > 2 ? `(${joined})` : joined
    }

    case 'xor': {
      const parts = node.children.map(c => printExpr(c, opts, 2))
      const joined = parts.join(' ⊕ ')
      return precedence > 2 ? `(${joined})` : joined
    }

    case 'xnor': {
      const parts = node.children.map(c => printExpr(c, opts, 2))
      const joined = parts.join(' ⊙ ')
      return precedence > 2 ? `(${joined})` : joined
    }

    case 'nand': {
      const parts = node.children.map(c => printExpr(c, opts, 3))
      const joined = parts.join('·')
      if (notNotation === 'prime') return `(${joined})'`
      return `̅(${joined})`
    }

    case 'nor': {
      const parts = node.children.map(c => printExpr(c, opts, 2))
      const joined = parts.join(' + ')
      if (notNotation === 'prime') return `(${joined})'`
      return `̅(${joined})`
    }
  }
}
