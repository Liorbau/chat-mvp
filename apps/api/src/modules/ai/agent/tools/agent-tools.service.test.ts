import { describe, expect, it, vi } from 'vitest'
import { AgentToolsService } from './agent-tools.service'

function stubTool(name: string) {
  return { definition: { name, description: `${name} tool`, inputSchema: {} }, execute: vi.fn() }
}

function build(): AgentToolsService {
  return new AgentToolsService(
    {} as never,
    stubTool('get_my_name') as never,
    stubTool('summarize_my_recent_messages') as never,
  )
}

describe('AgentToolsService', () => {
  it('exposes the retrieval tool plus the user-data tools', () => {
    expect(
      build()
        .all()
        .map((tool) => tool.name)
        .sort(),
    ).toEqual(['get_my_name', 'retrieve_knowledge', 'summarize_my_recent_messages'])
  })

  it('finds a tool by name and returns undefined for unknown tools', () => {
    const service = build()
    expect(service.get('retrieve_knowledge')?.name).toBe('retrieve_knowledge')
    expect(service.get('nope')).toBeUndefined()
  })

  it('identifies only the retrieval tool as retrieval', () => {
    const service = build()
    expect(service.isRetrieval('retrieve_knowledge')).toBe(true)
    expect(service.isRetrieval('get_my_name')).toBe(false)
  })
})
