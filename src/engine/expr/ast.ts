/** Boolean expression AST */

export type ExprNode =
  | { kind: 'var'; name: string }
  | { kind: 'const'; value: 0 | 1 }
  | { kind: 'not'; child: ExprNode }
  | { kind: 'and'; children: ExprNode[] }
  | { kind: 'or'; children: ExprNode[] }
  | { kind: 'xor'; children: ExprNode[] }
  | { kind: 'xnor'; children: ExprNode[] }
  | { kind: 'nand'; children: ExprNode[] }
  | { kind: 'nor'; children: ExprNode[] }

export type ExprResult =
  | { ok: true; expr: ExprNode }
  | { ok: false; reason: string }

/** Evaluate an AST given variable assignments */
export function evalExpr(node: ExprNode, vars: Record<string, 0 | 1>): 0 | 1 {
  switch (node.kind) {
    case 'var': return vars[node.name] ?? 0
    case 'const': return node.value
    case 'not': return evalExpr(node.child, vars) === 0 ? 1 : 0
    case 'and': return node.children.every(c => evalExpr(c, vars) === 1) ? 1 : 0
    case 'or': return node.children.some(c => evalExpr(c, vars) === 1) ? 1 : 0
    case 'xor': {
      let v = 0
      for (const c of node.children) v ^= evalExpr(c, vars)
      return v as 0 | 1
    }
    case 'xnor': {
      let v = 0
      for (const c of node.children) v ^= evalExpr(c, vars)
      return (v === 0 ? 1 : 0) as 0 | 1
    }
    case 'nand': return node.children.every(c => evalExpr(c, vars) === 1) ? 0 : 1
    case 'nor': return node.children.some(c => evalExpr(c, vars) === 1) ? 0 : 1
  }
}

/** Collect all variable names from an expression */
export function collectVars(node: ExprNode): Set<string> {
  const vars = new Set<string>()
  function walk(n: ExprNode) {
    if (n.kind === 'var') { vars.add(n.name); return }
    if (n.kind === 'const') return
    if (n.kind === 'not') { walk(n.child); return }
    for (const c of n.children) walk(c)
  }
  walk(node)
  return vars
}
