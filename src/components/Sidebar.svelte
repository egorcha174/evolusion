<script lang="ts">
  export let isOpen: boolean = true;
  export let activeTab: string = 'Home';

  // Updated tabs to match the modern dashboard style
  export let tabs: string[] = ['Home', 'Living Room', 'Server Rack', 'Multimedia', 'Climate', 'Entities'];

  function selectTab(tab: string) {
    activeTab = tab;
  }

  // Get current time and date
  $: currentTime = new Date();
  $: timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  $: dateString = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Weather data (mock for now)
  const weatherData = {
    current: {
      temp: '22°C',
      condition: 'Partly cloudy'
    },
    forecast: [
      { day: 'Mon', icon: '☀️', min: '18°C', max: '24°C' },
      { day: 'Tue', icon: '☁️', min: '16°C', max: '22°C' },
      { day: 'Wed', icon: '🌧️', min: '14°C', max: '20°C' }
    ]
  };

  // Status notifications
  const statusNotifications = [
    { icon: '🚪', text: 'Entrance door is closed now' },
    { icon: '🚗', text: 'Car doors are currently locked' }
  ];

  // Week schedule
  const weekSchedule = {
    week: 'Week 24',
    events: ['Meeting', 'Grocery', 'Gym']
  };
</script>

<aside class="sidebar" class:open={isOpen}>
  <div class="sidebar-header">
    <div class="time-date">
      <div class="time">{timeString}</div>
      <div class="date">{dateString}</div>
    </div>
  </div>

  <div class="camera-preview">
    <div class="camera-card">
      <img src="https://via.placeholder.com/300x180/333/fff?text=Camera+Preview" alt="Camera Preview" class="camera-image">
      <div class="camera-label">Front Door</div>
    </div>
  </div>

  <div class="status-notifications">
    {#each statusNotifications as notification}
      <div class="status-item">
        <span class="status-icon">{notification.icon}</span>
        <span class="status-text">{notification.text}</span>
      </div>
    {/each}
  </div>

  <div class="week-schedule">
    <div class="week-header">{weekSchedule.week}</div>
    <div class="week-events">
      {#each weekSchedule.events as event}
        <div class="week-event">{event}</div>
      {/each}
    </div>
  </div>

  <nav class="sidebar-nav">
    {#each tabs as tab}
      <button
        class="sidebar-tab"
        class:active={activeTab === tab}
        on:click={() => selectTab(tab)}
      >
        <span class="tab-icon">
          {#if tab === 'Home'}🏠{:else if tab === 'Living Room'}🛋️{:else if tab === 'Server Rack'}💻{:else if tab === 'Multimedia'}🎵{:else if tab === 'Climate'}🌡️{:else if tab === 'Entities'}📋{/if}
        </span>
        <span class="tab-text">{tab}</span>
        {#if activeTab === tab}
          <span class="active-indicator">▶</span>
        {/if}
      </button>
    {/each}
  </nav>

  <div class="weather-widget">
    <div class="current-weather">
      <span class="weather-temp">{weatherData.current.temp}</span>
      <span class="weather-condition">{weatherData.current.condition}</span>
    </div>
    <div class="weather-forecast">
      {#each weatherData.forecast as day}
        <div class="forecast-day">
          <span class="forecast-icon">{day.icon}</span>
          <span class="forecast-temps">{day.min} / {day.max}</span>
        </div>
      {/each}
    </div>
    <div class="energy-usage">
      Household energy usage: <span class="energy-value">0.4 kW</span>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    width: 320px;
    height: 100vh;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: white;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 10;
    overflow-y: auto;
    transition: transform 0.3s ease;
    padding: 1rem;
    box-sizing: border-box;
  }

  .sidebar:not(.open) {
    transform: translateX(-100%);
  }

  .sidebar-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .time-date {
    text-align: center;
  }

  .time {
    font-size: 2.5rem;
    font-weight: 300;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }

  .date {
    font-size: 1rem;
    opacity: 0.8;
  }

  .camera-preview {
    margin-bottom: 1.5rem;
    border-radius: 12px;
    overflow: hidden;
  }

  .camera-card {
    position: relative;
  }

  .camera-image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
  }

  .camera-label {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    text-align: center;
    opacity: 0.8;
  }

  .status-notifications {
    margin-bottom: 1.5rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.75rem;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    font-size: 0.85rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .status-item:last-child {
    border-bottom: none;
  }

  .status-icon {
    font-size: 1.2rem;
  }

  .week-schedule {
    margin-bottom: 1.5rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.75rem;
  }

  .week-header {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    opacity: 0.9;
  }

  .week-events {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .week-event {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .sidebar-tab {
    padding: 0.85rem 1rem;
    text-align: left;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
  }

  .sidebar-tab:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .sidebar-tab.active {
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
    color: white;
    border-left-color: #3b82f6;
  }

  .tab-icon {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
  }

  .tab-text {
    flex: 1;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .active-indicator {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .weather-widget {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    text-align: center;
  }

  .current-weather {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .weather-temp {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .weather-condition {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .weather-forecast {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    gap: 0.5rem;
  }

  .forecast-day {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
  }

  .forecast-icon {
    font-size: 1.2rem;
  }

  .forecast-temps {
    font-size: 0.7rem;
    opacity: 0.8;
  }

  .energy-usage {
    font-size: 0.8rem;
    opacity: 0.8;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .energy-value {
    font-weight: 600;
    color: #3b82f6;
  }
</style>
