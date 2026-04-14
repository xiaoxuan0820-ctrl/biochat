import React, { useState, useEffect } from 'react'
import { useStore } from '../stores/appStore'
import type { Settings } from '../types'

export default function Settings() {
  const { settings, updateSettings, setSettingsOpen } = useStore()
  const [localSettings, setLocalSettings] = useState<Settings>(settings)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = async () => {
    await updateSettings(localSettings)
    setSettingsOpen(false)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch(`${localSettings.apiEndpoint}/models`, {
        headers: {
          'Authorization': `Bearer ${localSettings.apiKey}`
        }
      })
      
      if (response.ok) {
        setTestResult({ success: true, message: '连接成功！' })
      } else {
        const error = await response.json().catch(() => ({}))
        setTestResult({ 
          success: false, 
          message: `连接失败: ${response.status} ${error.error?.message || ''}` 
        })
      }
    } catch (error: any) {
      setTestResult({ success: false, message: `连接失败: ${error.message}` })
    } finally {
      setIsTesting(false)
    }
  }

  const commonModels = [
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
    'gpt-4',
    'gpt-4-turbo-preview',
    'gpt-4o',
    'gpt-4o-mini'
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-100 rounded-xl w-full max-w-lg mx-4 shadow-2xl border border-dark-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-200">
          <h2 className="text-lg font-bold text-gray-100">设置</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1 rounded-lg hover:bg-dark-200 text-gray-400 hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* API Endpoint */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API 端点
            </label>
            <input
              type="text"
              value={localSettings.apiEndpoint}
              onChange={(e) => setLocalSettings({ ...localSettings, apiEndpoint: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              支持 OpenAI 兼容 API，可使用代理或第三方服务
            </p>
          </div>
          
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              你的 API Key 将安全存储在本地
            </p>
          </div>
          
          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              模型
            </label>
            <select
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
              className="w-full bg-dark-50 border border-dark-300 rounded-lg px-3 py-2 text-gray-100"
            >
              <option value="">选择模型</option>
              {commonModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            <input
              type="text"
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
              placeholder="或输入自定义模型名称"
              className="w-full mt-2"
            />
          </div>
          
          {/* Test Connection */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={!localSettings.apiKey || isTesting}
              className={`btn ${isTesting ? 'bg-gray-600 cursor-not-allowed' : 'btn-secondary'}`}
            >
              {isTesting ? '测试中...' : '测试连接'}
            </button>
            {testResult && (
              <p className={`mt-2 text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {testResult.message}
              </p>
            )}
          </div>
          
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              主题
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={localSettings.theme === 'dark'}
                  onChange={() => setLocalSettings({ ...localSettings, theme: 'dark' })}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-gray-300">深色</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={localSettings.theme === 'light'}
                  onChange={() => setLocalSettings({ ...localSettings, theme: 'light' })}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-gray-300">浅色</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-dark-200">
          <button
            onClick={() => setSettingsOpen(false)}
            className="btn btn-ghost"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
