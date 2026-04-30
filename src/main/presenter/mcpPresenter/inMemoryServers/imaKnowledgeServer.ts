import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import axios from 'axios'

// ── Zod Schemas for Tool Arguments ──

const ListKnowledgeBasesArgsSchema = z.object({
  cursor: z.string().optional().default('').describe('分页游标，首次传空'),
  limit: z.number().optional().default(20).describe('数量限制 (1-50)')
})

const QueryKnowledgeBaseArgsSchema = z.object({
  knowledge_base_id: z.string().describe('知识库 ID'),
  query: z.string().describe('搜索查询内容')
})

const GetKnowledgeBaseInfoArgsSchema = z.object({
  knowledge_base_id: z.string().describe('知识库 ID')
})

const BrowseKnowledgeArgsSchema = z.object({
  knowledge_base_id: z.string().describe('知识库 ID'),
  folder_id: z.string().optional().describe('文件夹 ID（省略则列出根目录）'),
  cursor: z.string().optional().default('').describe('分页游标'),
  limit: z.number().optional().default(20).describe('数量限制 (1-50)')
})

const SearchKnowledgeBaseArgsSchema = z.object({
  query: z.string().describe('搜索关键词'),
  cursor: z.string().optional().default('').describe('分页游标'),
  limit: z.number().optional().default(10).describe('数量限制 (1-50)')
})

// ── IMA API Response Types ──

interface IMAKnowledgeBaseInfo {
  id: string
  name: string
  cover_url: string
  description: string
  recommended_questions: string[]
}

interface IMASearchedKnowledgeInfo {
  media_id: string
  title: string
  parent_folder_id: string
  highlight_content: string
}

interface IMASearchedKnowledgeBaseInfo {
  id: string
  name: string
  cover_url: string
}

interface IMAKnowledgeInfo {
  media_id: string
  title: string
  parent_folder_id: string
}

interface IMAFolderInfo {
  folder_id: string
  name: string
  file_number: number
  folder_number: number
  parent_folder_id: string
  is_top: boolean
}

interface IMAKnowledgeListResponse {
  knowledge_list: IMAKnowledgeInfo[]
  is_end: boolean
  next_cursor: string
  current_path: IMAFolderInfo[]
}

interface IMAAddableKnowledgeBaseInfo {
  id: string
  name: string
}

interface IMAAPIResponse<T> {
  retcode: number
  errmsg: string
  data: T
}

// ── IMA Knowledge Server ──

export class ImaKnowledgeServer {
  private server: Server
  private clientId: string
  private apiKey: string

  constructor(env?: Record<string, unknown>) {
    if (!env) {
      throw new Error('需要提供 IMA 知识库配置')
    }

    this.clientId = String(env?.clientId ?? '')
    this.apiKey = String(env?.apiKey ?? '')

    if (!this.clientId) {
      throw new Error('需要提供 IMA Client ID（在 ima.qq.com/agent-interface 获取）')
    }
    if (!this.apiKey) {
      throw new Error('需要提供 IMA API Key（在 ima.qq.com/agent-interface 获取）')
    }

    this.server = new Server(
      {
        name: 'biochat-inmemory/ima-knowledge-server',
        version: '0.1.0'
      },
      {
        capabilities: { tools: {} }
      }
    )

    this.setupRequestHandlers()
  }

  public startServer(transport: Transport): void {
    this.server.connect(transport)
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'ima-openapi-clientid': this.clientId,
      'ima-openapi-apikey': this.apiKey
    }
  }

  private async apiPost<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    try {
      const response = await axios.post<IMAAPIResponse<T>>(
        `https://ima.qq.com/openapi/wiki/v1/${endpoint}`,
        body,
        { headers: this.getHeaders() }
      )
      if (response.data.retcode !== 0) {
        throw new Error(`IMA API 错误: ${response.data.errmsg} (code: ${response.data.retcode})`)
      }
      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`IMA API 请求失败 (${error.response.status}): ${JSON.stringify(error.response.data)}`)
      }
      throw error
    }
  }

  private setupRequestHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_knowledge_bases',
            description: '列出当前用户可添加内容的 IMA 知识库列表（不含已删除的知识库）',
            inputSchema: zodToJsonSchema(ListKnowledgeBasesArgsSchema),
            annotations: {
              title: '列出 IMA 知识库',
              readOnlyHint: true
            }
          },
          {
            name: 'search_knowledge_bases',
            description: '搜索 IMA 知识库列表，按关键词查找知识库',
            inputSchema: zodToJsonSchema(SearchKnowledgeBaseArgsSchema),
            annotations: {
              title: '搜索 IMA 知识库',
              readOnlyHint: true
            }
          },
          {
            name: 'get_knowledge_base_info',
            description: '获取指定 IMA 知识库的详细信息，包括名称、描述、推荐问题等',
            inputSchema: zodToJsonSchema(GetKnowledgeBaseInfoArgsSchema),
            annotations: {
              title: '获取知识库信息',
              readOnlyHint: true
            }
          },
          {
            name: 'query_knowledge_base',
            description: '在指定的 IMA 知识库中搜索内容，返回匹配的知识条目及其高亮内容。用于知识库问答场景',
            inputSchema: zodToJsonSchema(QueryKnowledgeBaseArgsSchema),
            annotations: {
              title: '查询 IMA 知识库',
              readOnlyHint: true
            }
          },
          {
            name: 'browse_knowledge',
            description: '浏览 IMA 知识库中的文件/文件夹列表，支持进入子文件夹和分页',
            inputSchema: zodToJsonSchema(BrowseKnowledgeArgsSchema),
            annotations: {
              title: '浏览知识库内容',
              readOnlyHint: true
            }
          }
        ]
      }
    })

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params

        switch (name) {
          case 'list_knowledge_bases': {
            const parsed = ListKnowledgeBasesArgsSchema.safeParse(args)
            if (!parsed.success) throw new Error(`参数无效: ${parsed.error}`)
            const { cursor, limit } = parsed.data
            const result = await this.apiPost<{
              addable_knowledge_base_list: IMAAddableKnowledgeBaseInfo[]
              next_cursor: string
              is_end: boolean
            }>('get_addable_knowledge_base_list', { cursor, limit })

            let text = '### IMA 知识库列表\n\n'
            if (result.addable_knowledge_base_list.length === 0) {
              text += '暂无可添加的知识库。'
            } else {
              result.addable_knowledge_base_list.forEach((kb, i) => {
                text += `${i + 1}. **${kb.name}** (ID: \`${kb.id}\`)\n`
              })
              text += '\n使用 \`query_knowledge_base\` 工具并传入知识库 ID 来查询内容。'
            }
            return { content: [{ type: 'text', text }] }
          }

          case 'search_knowledge_bases': {
            const parsed = SearchKnowledgeBaseArgsSchema.safeParse(args)
            if (!parsed.success) throw new Error(`参数无效: ${parsed.error}`)
            const result = await this.apiPost<{
              info_list: IMASearchedKnowledgeBaseInfo[]
              next_cursor: string
              is_end: boolean
            }>('search_knowledge_base', parsed.data)

            let text = `### 搜索结果: "${parsed.data.query}"\n\n`
            if (result.info_list.length === 0) {
              text += '未找到匹配的知识库。'
            } else {
              result.info_list.forEach((kb) => {
                text += `- **${kb.name}** (ID: \`${kb.id}\`)\n`
              })
            }
            return { content: [{ type: 'text', text }] }
          }

          case 'get_knowledge_base_info': {
            const parsed = GetKnowledgeBaseInfoArgsSchema.safeParse(args)
            if (!parsed.success) throw new Error(`参数无效: ${parsed.error}`)
            const result = await this.apiPost<{ infos: Record<string, IMAKnowledgeBaseInfo> }>(
              'get_knowledge_base',
              { ids: [parsed.data.knowledge_base_id] }
            )

            const info = result.infos[parsed.data.knowledge_base_id]
            if (!info) {
              return { content: [{ type: 'text', text: '未找到该知识库信息。' }] }
            }

            let text = `### ${info.name}\n\n`
            text += `**描述**: ${info.description || '无'}\n\n`
            if (info.recommended_questions?.length > 0) {
              text += '**推荐问题**:\n'
              info.recommended_questions.forEach((q) => { text += `- ${q}\n` })
            }
            return { content: [{ type: 'text', text }] }
          }

          case 'query_knowledge_base': {
            const parsed = QueryKnowledgeBaseArgsSchema.safeParse(args)
            if (!parsed.success) throw new Error(`参数无效: ${parsed.error}`)
            const result = await this.apiPost<{
              info_list: IMASearchedKnowledgeInfo[]
              next_cursor: string
              is_end: boolean
            }>('search_knowledge', parsed.data)

            let text = `### 知识库搜索: "${parsed.data.query}"\n\n`
            if (result.info_list.length === 0) {
              text += '未找到相关结果。'
            } else {
              result.info_list.forEach((item, i) => {
                text += `#### ${i + 1}. ${item.title}\n`
                if (item.highlight_content) {
                  text += `${item.highlight_content}\n`
                }
                text += '\n'
              })
            }
            return { content: [{ type: 'text', text }] }
          }

          case 'browse_knowledge': {
            const parsed = BrowseKnowledgeArgsSchema.safeParse(args)
            if (!parsed.success) throw new Error(`参数无效: ${parsed.error}`)
            const result = await this.apiPost<IMAKnowledgeListResponse>(
              'get_knowledge_list',
              {
                cursor: parsed.data.cursor,
                limit: parsed.data.limit,
                knowledge_base_id: parsed.data.knowledge_base_id,
                folder_id: parsed.data.folder_id
              }
            )

            let text = `### 知识库内容浏览\n\n`
            if (result.current_path?.length > 0) {
              text += `**当前位置**: ${result.current_path.map(p => p.name).join(' / ') || '根目录'}\n\n`
            }
            const items = result.knowledge_list || []
            if (items.length === 0) {
              text += '该位置暂无内容。'
            } else {
              items.forEach((item) => {
                text += `- ${item.title} (ID: \`${item.media_id}\`)\n`
              })
            }
            if (!result.is_end) {
              text += `\n\n*还有更多内容，使用 cursor="${result.next_cursor}" 继续浏览*`
            }
            return { content: [{ type: 'text', text }] }
          }

          default:
            throw new Error(`未知工具: ${name}`)
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: `错误: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true
        }
      }
    })
  }
}
