import * as vscode from 'vscode'

/** Every command here assumes a single-root workspace — the common case
 * for a mobile app project. Multi-root support (picking which folder) is
 * a reasonable future addition, not attempted here. */
export function getWorkspaceRoot(): string {
  const folder = vscode.workspace.workspaceFolders?.[0]
  if (!folder) {
    throw new Error('Open a folder or workspace first.')
  }
  return folder.uri.fsPath
}

const terminals = new Map<string, vscode.Terminal>()

/** Reuses a terminal by name if it's still open (e.g. re-running `doctor`
 * shows in the same tab instead of piling up new ones), creating a fresh
 * one otherwise. */
export function runInTerminal(name: string, cwd: string, commandLine: string): void {
  const existing = terminals.get(name)
  const terminal = existing && !isTerminalClosed(existing)
    ? existing
    : vscode.window.createTerminal({ name, cwd })

  terminals.set(name, terminal)
  terminal.show()
  terminal.sendText(commandLine, true)
}

function isTerminalClosed(terminal: vscode.Terminal): boolean {
  return !vscode.window.terminals.includes(terminal)
}
