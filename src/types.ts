export interface Message {
    role: 'system' | 'user' | 'assistant' | 'function',
    content: string
    name?: string
    function_call?: { arguments: string, name: string }
}