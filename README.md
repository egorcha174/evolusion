# Evolusion

**Modern Svelte 5 Frontend Dashboard for Home Assistant**

Evolusion is a cutting-edge, production-ready frontend dashboard project built with **Svelte 5** and **SvelteKit**, designed to provide an advanced, highly interactive interface for Home Assistant automation systems. This project leverages modern web technologies and best practices to deliver a performant, scalable solution for smart home control and monitoring.

## 🌟 Features

### Core Features
- ⚡ **Svelte 5** - Latest reactive framework with signal-based reactivity and performance optimizations
- 🎨 **Advanced UI Components** - Custom, reusable components with Tailwind CSS styling
- 📊 **Real-time Data Visualization** - Live updates with websocket integration for device states and metrics
- 🏠 **Home Assistant Integration** - Seamless API integration for device control and automation
- 📱 **Responsive Design** - Mobile-first, fully responsive interface supporting all screen sizes
- 🎯 **Custom Dashboard** - Drag-and-drop widget configuration and personalization
- ⚙️ **IoT Device Management** - Support for multiple device types (lights, switches, climate, media players, etc.)
- 🔒 **Type-Safe** - Full TypeScript support for enhanced development experience

### Developer Features
- 🔧 **Hot Module Replacement** - Fast development with HMR enabled
- 📦 **Optimized Bundle Size** - Production-ready optimizations with code splitting
- 🧪 **Testing Ready** - Pre-configured testing setup
- 📚 **Well Documented** - Comprehensive documentation and code comments
- 🚀 **CI/CD Ready** - GitHub Actions workflow included

## 🛠️ Tech Stack

### Frontend
- **Framework**: Svelte 5 with SvelteKit
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first CSS
- **TypeScript**: Full type safety across the codebase
- **State Management**: Svelte stores for reactive state

### Backend Integration
- **API**: Home Assistant REST API
- **WebSocket**: Real-time updates via Home Assistant WebSocket
- **Protocol**: MQTT support for additional IoT integrations

### DevOps & Quality
- **Version Control**: Git with GitHub
- **Package Manager**: npm/pnpm
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier
- **Testing**: Vitest and Playwright

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **npm** or **pnpm**: Latest version
- **Home Assistant**: 2024.1.x or later
- **Basic Knowledge**: Familiarity with Svelte, TypeScript, and REST APIs

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/egorcha174/evolusion.git
cd evolusion
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure Home Assistant Connection

Create a `.env.local` file in the project root:

```env
VITE_HA_URL=http://192.168.1.100:8123
VITE_HA_TOKEN=your_long_lived_access_token
```

### 4. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
# or
pnpm build
```

## 📁 Project Structure

```
evolusion/
├── src/
│   ├── components/       # Reusable UI components
│   ├── routes/          # SvelteKit routes and pages
│   ├── lib/             # Utility functions and helpers
│   ├── stores/          # Svelte stores for state management
│   ├── types/           # TypeScript type definitions
│   └── App.svelte       # Root component
├── static/              # Static assets
├── tests/               # Test files
├── vite.config.ts       # Vite configuration
├── svelte.config.js     # SvelteKit configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── package.json         # Project dependencies
```

## 🔌 Home Assistant Integration

### Supported Services
- Light control (on/off, brightness, color)
- Switch control
- Climate (temperature, modes)
- Media players
- Covers (blinds, doors)
- Lock control
- Sensor readings
- Binary sensors

### API Setup

1. Generate a Long-Lived Access Token in Home Assistant:
   - Go to Settings → Devices & Services → Developers Tools
   - Create a Long-Lived Access Token
   - Copy and save the token

2. Configure CORS (if needed):
   - Add to Home Assistant `configuration.yaml`:
   ```yaml
   http:
     cors_allowed_origins:
       - http://localhost:5173
       - your-dashboard-url.com
   ```

## 📚 Documentation

For detailed documentation on components, API, and advanced usage, please refer to:
- [Component Library](./docs/components.md)
- [API Reference](./docs/api.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🤝 Contributing

Contributions are welcome and appreciated! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes tests.

## 📝 Development Guidelines

- Use TypeScript for type safety
- Follow the existing code style (use `npm run format`)
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Use conventional commits (feat:, fix:, docs:, etc.)

## 🐛 Known Issues & Limitations

- WebSocket connection requires Home Assistant to be accessible
- Some complex automations may require additional API calls
- Real-time updates depend on network stability

## 🗺️ Roadmap

- [ ] Advanced automation editor
- [ ] Custom card template system
- [ ] Weather widget integration
- [ ] Multi-user support with role-based access
- [ ] Scene creation and management
- [ ] History and analytics dashboard
- [ ] Voice assistant integration
- [ ] PWA support
- [ ] Dark mode toggle
- [ ] Internationalization (i18n)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Svelte](https://svelte.dev) - The reactive JavaScript framework
- [SvelteKit](https://kit.svelte.dev) - The web development framework
- [Home Assistant](https://www.home-assistant.io) - The open platform for home automation
- [Tailwind CSS](https://tailwindcss.com) - The utility-first CSS framework

## 📞 Support & Community

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/egorcha174/evolusion/issues)
- **Discussions**: Join our community discussions
- **Documentation**: Visit the [docs](./docs) folder for detailed guides

## 🚀 Deployment

### Docker Support

A Docker configuration is available for easy deployment:

```bash
docker build -t evolusion .
docker run -p 3000:3000 evolusion
```

### Vercel/Netlify

This project can be deployed to Vercel or Netlify with minimal configuration:

```bash
# For Vercel
vercel deploy

# For Netlify
netlify deploy
```

## 💡 Tips & Best Practices

1. Use environment variables for sensitive data
2. Enable HTTPS in production
3. Implement proper authentication
4. Monitor network requests in DevTools
5. Use the Home Assistant Developer Tools for debugging
6. Keep dependencies updated regularly
7. Consider using a reverse proxy (Nginx, Traefik) for production

---

**Built with ❤️ for the Home Assistant Community**

*Last updated: December 2025*
