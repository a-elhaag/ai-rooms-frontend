<template>
  <div class="about-view">
    <div class="about-container">
      <div class="about-header">
        <div class="about-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <h1>About AI Rooms</h1>
        <p class="about-tagline">Lightweight spaces for AI collaboration</p>
      </div>

      <div class="about-content">
        <div class="about-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <path d="M7 9h10" />
              <path d="M7 13h6" />
            </svg>
          </div>
          <h3>Smart Rooms</h3>
          <p>
            Create focused workspaces where you and AI collaborate on specific tasks and projects.
          </p>
        </div>

        <div class="about-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="3" />
              <path
                d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              />
            </svg>
          </div>
          <h3>AI-Powered</h3>
          <p>Leverage advanced AI capabilities to enhance your productivity and creativity.</p>
        </div>

        <div class="about-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3>Collaboration</h3>
          <p>
            Work together with your team and AI in real-time, sharing ideas and getting things done.
          </p>
        </div>
      </div>

      <div class="about-footer">
        <p>Built with ❤️ for the future of work</p>
        <div class="version-badge">v1.0.0</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: radial-gradient(circle at top, #eef4ff 0%, #f9fafb 50%, #ffffff 100%);
}

.about-container {
  max-width: 800px;
  width: 100%;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.about-header {
  text-align: center;
  margin-bottom: var(--space-10);
}

.about-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary), var(--primary-soft));
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-5);
  box-shadow: 0 16px 40px rgba(37, 99, 235, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.about-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.about-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.about-tagline {
  font-size: 1.1rem;
  color: var(--text-muted);
}

.about-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-5);
  margin-bottom: var(--space-10);
}

.about-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  text-align: center;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease backwards;
}

.about-card:nth-child(1) {
  animation-delay: 0.1s;
}
.about-card:nth-child(2) {
  animation-delay: 0.2s;
}
.about-card:nth-child(3) {
  animation-delay: 0.3s;
}

.about-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-muted);
}

.card-icon {
  width: 56px;
  height: 56px;
  background: var(--primary-muted);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  transition: all 0.3s ease;
}

.about-card:hover .card-icon {
  background: linear-gradient(135deg, var(--primary), var(--primary-soft));
}

.card-icon svg {
  width: 28px;
  height: 28px;
  color: var(--primary);
  transition: color 0.3s ease;
}

.about-card:hover .card-icon svg {
  color: white;
}

.about-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.about-card p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.about-footer {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.about-footer p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.version-badge {
  display: inline-flex;
  padding: var(--space-1) var(--space-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

@media (max-width: 768px) {
  .about-header h1 {
    font-size: 1.75rem;
  }

  .about-content {
    grid-template-columns: 1fr;
  }
}
</style>
