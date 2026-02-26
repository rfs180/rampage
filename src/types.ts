export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatConfig {
  n8nWebhookUrl: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  isComingSoon?: boolean;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}
