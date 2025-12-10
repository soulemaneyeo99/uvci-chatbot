export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  message_count?: number;
  messages?: Message[];
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  message_id: string;
  sources?: string[];
  timestamp: string;
}

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  upload_date: string;
  status: 'processing' | 'indexed' | 'error';
  chunk_count: number;
  file_size: number;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  user_id?: string;
}
