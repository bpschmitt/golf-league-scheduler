# ⛳ Golf League Team Generator

A smart web application for managing weekly golf league team pairings with intelligent pairing history tracking to maximize player variety throughout the season.

![Golf League Manager](https://img.shields.io/badge/React-18.0-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.0-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

### 📊 Smart Team Generation
- **Handicap-Based Grouping**: Automatically divides players into A/B/C/D skill tiers
- **Pairing Optimization**: Runs 50+ iterations to minimize repeat pairings
- **Balanced Teams**: Each team gets one player from each skill level
- **Flexible Size**: Handles any number of players (up to 100+)

### 👥 Player Management
- Add players manually or bulk import via CSV
- Update handicaps easily (no duplicate names allowed)
- Export player roster to CSV for backup
- Visual handicap-sorted roster

### 📈 History & Statistics
- Track all weekly team pairings
- View pairing frequency statistics per player
- Archive complete season history
- See who plays together most/least

### 🏆 Season Management
- Save complete seasons with all history
- Load previous seasons to review data
- Manage multiple seasons (Spring, Fall, etc.)
- Export/Import all data for backup or device switching

### 💾 Data Persistence
- Automatic browser localStorage saving
- Export complete data as JSON file
- Import data on any device/browser
- No server or account required

## 🚀 Quick Start

### Run Locally with Create React App
```bash
# Create the app
npx create-react-app golf-league-scheduler
cd golf-league-scheduler

# Install dependencies
npm install lucide-react
npm install -D tailwindcss@3 postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

**Configure Tailwind** (`tailwind.config.js`):
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**Add Tailwind directives** (`src/index.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Replace `src/App.js`** with the component code, then:
```bash
npm start
```

## 📖 How to Use

### 1️⃣ Add Players
- **Manual Entry**: Type name and handicap, click "Add"
- **CSV Import**: Upload or paste CSV data (format: `Name, Handicap`)
- **Update Handicaps**: Re-add players with new handicap values

### 2️⃣ Generate Teams
- Click "Generate Teams" to create optimized 4-person teams
- Algorithm assigns A/B/C/D players by quartile ranking
- Teams are optimized to minimize repeat pairings

### 3️⃣ Save Weekly Results
- Review generated teams
- Click "Save to History" to archive and update pairing stats
- History tracks who has played together

### 4️⃣ Manage Seasons
- Click "Save as Season" to archive current history
- Start new season with "Clear History"
- Load previous seasons anytime from "Seasons" tab

### 5️⃣ Backup & Transfer
- Export all data (JSON) for backup or device transfer
- Import on any computer to restore complete state

## 📊 CSV Format
```csv
Name,Handicap
John Smith,8.5
Jane Doe,12.3
Bob Jones,5.2
Alice Williams,15.7
```

## 🎨 Screenshots

### Team Generation
Automatically creates balanced teams with smart pairing optimization.

### Pairing Statistics
Track who plays together most frequently to ensure variety.

### Season Management
Archive and manage multiple seasons of league play.

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Tailwind CSS 3** - Styling
- **Lucide React** - Icons
- **localStorage** - Data persistence
- **Vanilla JavaScript** - No backend required

## 📝 Algorithm Details

### Skill Tier Assignment
Players are sorted by handicap and divided into quartiles:
- **A Players**: Top 25% (lowest handicaps)
- **B Players**: 25-50th percentile
- **C Players**: 50-75th percentile
- **D Players**: Bottom 25% (highest handicaps)

### Pairing Optimization
The algorithm:
1. Generates 50 random team configurations
2. Calculates "pairing score" for each (sum of previous pairings)
3. Selects configuration with lowest score (fewest repeat pairings)
4. Ensures maximum variety across the season

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use for your golf league!

## 🏌️ Perfect For

- Weekly men's/women's golf leagues
- Corporate golf outings
- Golf club member events
- Tournament practice rounds
- Any 4-person team sport needing pairing rotation

## 💡 Tips

- Export your data regularly as backup
- Save seasons at year-end before clearing
- Use the same browser for consistency
- Update handicaps seasonally for balanced teams

## 🐛 Known Limitations

- Browser localStorage is device/browser-specific
- Private/incognito mode won't persist data
- Clearing browser data will delete all history

---

**Built with ⛳ for golf league organizers**

Questions or issues? Open a GitHub issue!
