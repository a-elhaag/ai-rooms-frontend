<template>
  <button
    :class="[
      'app-btn',
      `app-btn--${variant}`,
      `app-btn--${size}`,
      { 'app-btn--icon-only': iconOnly, 'app-btn--loading': loading, 'app-btn--full': fullWidth },
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="app-btn__spinner"></span>
    <template v-else>
      <span v-if="$slots.icon" class="app-btn__icon">
        <slot name="icon" />
      </span>
      <span v-if="!iconOnly" class="app-btn__label">
        <slot />
      </span>
    </template>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'danger', 'success'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  iconOnly: Boolean,
  loading: Boolean,
  disabled: Boolean,
  fullWidth: Boolean,
})

defineEmits(['click'])
</script>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: inherit;
}

.app-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Sizes */
.app-btn--sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.8125rem;
  border-radius: var(--radius-md);
}

.app-btn--md {
  padding: 0.6rem 1.25rem;
  font-size: 0.875rem;
}

.app-btn--lg {
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
}

/* Icon only sizes */
.app-btn--icon-only.app-btn--sm {
  width: 32px;
  height: 32px;
  padding: 0;
}

.app-btn--icon-only.app-btn--md {
  width: 40px;
  height: 40px;
  padding: 0;
}

.app-btn--icon-only.app-btn--lg {
  width: 48px;
  height: 48px;
  padding: 0;
}

/* Variants */
.app-btn--primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-soft) 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
}

.app-btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.app-btn--primary:active:not(:disabled) {
  transform: translateY(0);
}

.app-btn--secondary {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.app-btn--secondary:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--border-strong);
}

.app-btn--ghost {
  background: transparent;
  color: var(--text-secondary);
}

.app-btn--ghost:hover:not(:disabled) {
  background: var(--surface);
  color: var(--text-primary);
}

.app-btn--danger {
  background: linear-gradient(135deg, var(--error) 0%, var(--error-soft) 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
}

.app-btn--danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.app-btn--success {
  background: linear-gradient(135deg, var(--success) 0%, var(--success-soft) 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.app-btn--success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* Full width */
.app-btn--full {
  width: 100%;
}

/* Icon */
.app-btn__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-btn__icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.app-btn--sm .app-btn__icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.app-btn--lg .app-btn__icon :deep(svg) {
  width: 20px;
  height: 20px;
}

/* Spinner */
.app-btn__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.app-btn--secondary .app-btn__spinner,
.app-btn--ghost .app-btn__spinner {
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: var(--text-primary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
