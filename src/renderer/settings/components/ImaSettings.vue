<template>
  <ScrollArea class="h-full w-full">
    <div class="flex h-full w-full flex-col gap-4 p-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="text-base font-medium">{{ t('settings.ima.title') }}</div>
        </div>
        <div class="text-sm text-muted-foreground">
          {{ t('settings.ima.description') }}
        </div>
      </div>

      <div class="rounded-xl border bg-card p-4 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{{ t('settings.ima.status') }}</span>
            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              :class="connectionStatusClass"
            >
              <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass"></span>
              {{ connectionStatusText }}
            </span>
          </div>
        </div>

        <div class="space-y-3">
          <div class="space-y-1.5">
            <Label for="ima-client-id">{{ t('settings.ima.clientId') }}</Label>
            <Input
              id="ima-client-id"
              v-model="clientId"
              :placeholder="t('settings.ima.clientIdPlaceholder')"
              type="text"
            />
          </div>

          <div class="space-y-1.5">
            <Label for="ima-api-key">{{ t('settings.ima.apiKey') }}</Label>
            <Input
              id="ima-api-key"
              v-model="apiKey"
              :placeholder="t('settings.ima.apiKeyPlaceholder')"
              type="password"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button
            :disabled="!clientId || !apiKey || isTesting"
            @click="testConnection"
          >
            <template v-if="isTesting">
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              {{ t('common.testing') }}
            </template>
            <template v-else>
              {{ t('settings.ima.testConnection') }}
            </template>
          </Button>

          <Button variant="outline" @click="openAgentInterface">
            {{ t('settings.ima.getCredential') }}
          </Button>

          <Button
            variant="secondary"
            :disabled="!clientId || !apiKey"
            @click="saveConfig"
          >
            {{ t('common.save') }}
          </Button>
        </div>

        <div
          v-if="testResult"
          class="rounded-lg p-3 text-sm"
          :class="testResult.success ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'"
        >
          <div class="font-medium">{{ testResult.success ? '✅ ' + t('settings.ima.connectSuccess') : '❌ ' + t('settings.ima.connectFailed') }}</div>
          <div class="mt-1" v-if="testResult.message">{{ testResult.message }}</div>
        </div>
      </div>

      <div class="rounded-xl border bg-card p-4 space-y-3">
        <div class="text-sm font-medium">{{ t('settings.ima.howToGet') }}</div>
        <ol class="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>{{ t('settings.ima.step1') }}</li>
          <li>{{ t('settings.ima.step2') }}</li>
          <li>{{ t('settings.ima.step3') }}</li>
          <li>{{ t('settings.ima.step4') }}</li>
        </ol>
      </div>

      <div class="rounded-xl border bg-card p-4 space-y-2">
        <div class="text-sm font-medium">{{ t('settings.ima.availableTools') }}</div>
        <div class="text-sm text-muted-foreground space-y-1">
          <div><code class="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">list_knowledge_bases</code> — {{ t('settings.ima.toolList') }}</div>
          <div><code class="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">query_knowledge_base</code> — {{ t('settings.ima.toolQuery') }}</div>
          <div><code class="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">search_knowledge_bases</code> — {{ t('settings.ima.toolSearch') }}</div>
          <div><code class="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">get_knowledge_base_info</code> — {{ t('settings.ima.toolInfo') }}</div>
          <div><code class="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">browse_knowledge</code> — {{ t('settings.ima.toolBrowse') }}</div>
        </div>
      </div>
    </div>
  </ScrollArea>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLegacyPresenter } from '@api/legacy/presenters'
import { Button } from '@shadcn/components/ui/button'
import { Input } from '@shadcn/components/ui/input'
import { Label } from '@shadcn/components/ui/label'
import { ScrollArea } from '@shadcn/components/ui/scroll-area'
import { Loader2 } from 'lucide-vue-next'

const { t } = useI18n()
const configPresenter = useLegacyPresenter('configPresenter')

const clientId = ref('')
const apiKey = ref('')
const isTesting = ref(false)
const isConnected = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

const connectionStatusClass = computed(() => ({
  'bg-green-500/10 text-green-600': isConnected.value,
  'bg-yellow-500/10 text-yellow-600': !isConnected.value && (clientId.value || apiKey.value),
  'bg-gray-500/10 text-gray-500': !clientId.value && !apiKey.value
}))

const statusDotClass = computed(() => ({
  'bg-green-500': isConnected.value,
  'bg-yellow-500': !isConnected.value && (clientId.value || apiKey.value),
  'bg-gray-400': !clientId.value && !apiKey.value
}))

const connectionStatusText = computed(() => {
  if (isConnected.value) return t('settings.ima.connected')
  if (clientId.value || apiKey.value) return t('settings.ima.notConnected')
  return t('settings.ima.notConfigured')
})

async function loadConfig() {
  try {
    const mcpServers = await configPresenter.getMcpServers()
    const imaConfig = mcpServers?.imaKnowledge
    if (imaConfig?.env) {
      clientId.value = String(imaConfig.env.clientId ?? '')
      apiKey.value = String(imaConfig.env.apiKey ?? '')
      if (clientId.value && apiKey.value) {
        isConnected.value = true
      }
    }
  } catch (error) {
    console.error('Failed to load IMA config:', error)
  }
}

async function saveConfig() {
  try {
    await configPresenter.updateMcpServer('imaKnowledge', {
      env: { clientId: clientId.value, apiKey: apiKey.value }
    })
    testResult.value = { success: true, message: t('common.saved') }
  } catch (error) {
    testResult.value = { success: false, message: String(error) }
  }
}

async function testConnection() {
  isTesting.value = true
  testResult.value = null
  try {
    await saveConfig()
    // Enable the server and test
    await configPresenter.setMcpServerEnabled('imaKnowledge', true)
    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 1500))
    const isRunning = await configPresenter.isMcpServerRunning('imaKnowledge')
    if (isRunning) {
      isConnected.value = true
      testResult.value = { success: true, message: t('settings.ima.connectSuccessDetail') }
    } else {
      testResult.value = { success: false, message: t('settings.ima.serverNotStarted') }
    }
  } catch (error) {
    testResult.value = { success: false, message: String(error) }
  } finally {
    isTesting.value = false
  }
}

function openAgentInterface() {
  window.open('https://ima.qq.com/agent-interface', '_blank')
}

onMounted(() => {
  loadConfig()
})
</script>
