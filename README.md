# 🏠 3k MLV (My Little Vicinity)

> **Cozy multiplayer portfolio hub where you build your home, visit friends' project galleries, and discover amazing work.**

[![Build](https://img.shields.io/github/workflow/status/gunnchOS3k/3k-mlv/Deploy%20to%20Pages?style=flat-square)](https://github.com/gunnchOS3k/3k-mlv/actions)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-3k%20MLV-brightgreen?style=flat-square)](https://gunnchOS3k.github.io/3k-mlv)

---

## 🎮 **What is 3k MLV?**

3k MLV is a **cozy multiplayer portfolio hub** that combines the best of social gaming with professional networking. Build your virtual home, showcase your projects, and visit friends' galleries—all in a beautiful 3D world.

### ✨ **Key Features**

* 🏠 **Virtual Homes**: Customize your house layout and showcase your projects
* 👥 **Social Hub**: Visit friends' homes and discover their work
* 📱 **In-World Phone**: Launch demos and links without leaving the world
* 🎮 **Gamepad Support**: Full DualSense and Switch Pro controller support
* 🔄 **Shared Identity**: Same avatar and profile across Anime Aggressors
* ⚡ **Real-time Presence**: See who's online and chat with friends

---

## 🚀 **Quick Start**

### **Live Demo**
Visit [3k MLV](https://gunnchOS3k.github.io/3k-mlv) to experience the world!

### **Local Development**
```bash
# Clone the repository
git clone https://github.com/gunnchOS3k/3k-mlv.git
cd 3k-mlv

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3001
```

---

## 🏗️ **Architecture**

```
3k-mlv/
├── apps/
│   ├── mlv-web/           # Main 3k MLV app (Vite + Three.js)
│   └── anime-aggressors/   # Anime Aggressors game
├── packages/
│   └── shared/            # Shared types and Supabase client
├── infra/
│   └── supabase.sql       # Database schema
└── .github/workflows/     # GitHub Actions
```

### **Tech Stack**
* **Frontend**: React + TypeScript + Vite
* **3D Graphics**: Three.js + React Three Fiber
* **Backend**: Supabase (PostgreSQL + Realtime + Auth)
* **Deployment**: GitHub Pages
* **PWA**: Workbox for offline support

---

## 🎯 **How It Works**

### **1. Sign In & Create Profile**
- GitHub OAuth authentication
- Automatic profile creation
- Shared identity with Anime Aggressors

### **2. Build Your Home**
- Customize your house layout
- Add furniture and decorations
- Showcase your projects on the walls

### **3. Visit Friends**
- Walk through the neighborhood
- Click on houses to enter
- Browse friends' project galleries

### **4. Launch Demos**
- In-world phone interface
- Embedded demos where possible
- Fallback to new tabs for blocked sites

---

## 🎮 **Controls**

### **Mouse & Keyboard**
* **Mouse**: Look around the world
* **Scroll**: Zoom in/out
* **Click**: Interact with objects

### **Gamepad (DualSense/Switch Pro)**
* **Left Stick**: Move around
* **Right Stick**: Look around
* **A/Cross**: Interact
* **B/Circle**: Back/Menu
* **Start/Options**: Open phone

---

## 🔧 **Development**

### **Environment Setup**
```bash
# Copy environment template
cp apps/mlv-web/.env.example apps/mlv-web/.env.local

# Add your Supabase credentials
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **Database Setup**
1. Create a Supabase project
2. Run the SQL schema from `infra/supabase.sql`
3. Enable GitHub OAuth in Supabase Auth settings

### **Available Scripts**
```bash
npm run dev          # Start 3k MLV development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run dev:anime    # Start Anime Aggressors dev server
npm run build:anime  # Build Anime Aggressors
```

---

## 📊 **Features Roadmap**

* **Q1 2025**: Core 3D world + basic homes
* **Q2 2025**: Advanced customization + real-time presence
* **Q3 2025**: Cross-game cosmetics + advanced social features
* **Q4 2025**: Mobile app + VR support

---

## 🤝 **Contributing**

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Run type checking
npm run type-check
```

---

## 📄 **License**

MIT License - see [LICENSE](LICENSE) for details.

---

## 🔗 **Related Projects**

* **Anime Aggressors** - Shōnen-style PvP arena brawler
* **gunnchAI3k** - Discord bot for career guidance and tutoring

---

**Built with ❤️ by the 3k MLV team**

🌐 [Live Demo](https://gunnchOS3k.github.io/3k-mlv) • 📱 [Mobile](https://github.com/gunnchOS3k/3k-mlv) • 💬 [Discord](https://discord.gg/3k-mlv)
