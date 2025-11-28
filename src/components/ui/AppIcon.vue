<template>
  <component
    :is="iconComponent"
    :class="['app-icon', `app-icon--${size}`]"
    :stroke-width="strokeWidth"
  />
</template>

<script setup>
import { computed } from 'vue'
import {
  User,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
  Search,
  Settings,
  Send,
  Paperclip,
  Mic,
  Smile,
  Plus,
  MoreHorizontal,
  MoreVertical,
  File,
  Link,
  FileText,
  Book,
  ExternalLink,
  Check,
  CheckCircle,
  Clock,
  MessageSquare,
  Sun,
  Moon,
  Monitor,
  Save,
  LogOut,
  LogIn,
  Bot,
  Sparkles,
  Key,
  Circle,
  Home,
  Info,
  Menu,
  X,
  ChevronRight,
  Brain,
  Clipboard,
  Box,
} from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
  },
  strokeWidth: {
    type: [String, Number],
    default: 2,
  },
})

const icons = {
  user: User,
  lock: Lock,
  unlock: Unlock,
  eye: Eye,
  'eye-off': EyeOff,
  alert: AlertTriangle,
  search: Search,
  settings: Settings,
  send: Send,
  paperclip: Paperclip,
  mic: Mic,
  smile: Smile,
  plus: Plus,
  'more-horizontal': MoreHorizontal,
  'more-vertical': MoreVertical,
  file: File,
  link: Link,
  'file-text': FileText,
  book: Book,
  'external-link': ExternalLink,
  check: Check,
  'check-circle': CheckCircle,
  clock: Clock,
  room: MessageSquare,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  save: Save,
  logout: LogOut,
  login: LogIn,
  bot: Bot,
  sparkle: Sparkles,
  key: Key,
  circle: Circle,
  home: Home,
  info: Info,
  menu: Menu,
  x: X,
  'chevron-right': ChevronRight,
  brain: Brain,
  clipboard: Clipboard,
  box: Box,
}

const iconComponent = computed(() => {
  return icons[props.name] || Circle
})
</script>

<style scoped>
.app-icon {
  flex-shrink: 0;
}

.app-icon--xs {
  width: 14px;
  height: 14px;
}

.app-icon--sm {
  width: 16px;
  height: 16px;
}

.app-icon--md {
  width: 20px;
  height: 20px;
}

.app-icon--lg {
  width: 24px;
  height: 24px;
}

.app-icon--xl {
  width: 32px;
  height: 32px;
}
</style>
