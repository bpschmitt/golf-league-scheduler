import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shuffle, History, TrendingUp, Save, FolderOpen, Download, Upload } from 'lucide-react';

const GolfLeagueManager = () => {
  const [players, setPlayers] = useState([]);
  const [currentTeams, setCurrentTeams] = useState([]);
  const [weeklyArchive, setWeeklyArchive] = useState([]);
  const [pairingHistory, setPairingHistory] = useState({});
  const [activeTab, setActiveTab] = useState('players');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerHandicap, setNewPlayerHandicap] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [csvText, setCsvText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [showSaveSeasonModal, setShowSaveSeasonModal] = useState(false);
  const [seasonName, setSeasonName] = useState('');
  const [seasons, setSeasons] = useState([]);
  const [currentSeason, setCurrentSeason] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem('golfPlayers');
    const savedArchive = localStorage.getItem('golfArchive');
    const savedHistory = localStorage.getItem('pairingHistory');
    const savedSeasons = localStorage.getItem('golfSeasons');
    const savedCurrentSeason = localStorage.getItem('currentSeason');
    
    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
    if (savedArchive) setWeeklyArchive(JSON.parse(savedArchive));
    if (savedHistory) setPairingHistory(JSON.parse(savedHistory));
    if (savedSeasons) setSeasons(JSON.parse(savedSeasons));
    if (savedCurrentSeason) setCurrentSeason(savedCurrentSeason);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('golfPlayers', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('golfArchive', JSON.stringify(weeklyArchive));
  }, [weeklyArchive]);

  useEffect(() => {
    localStorage.setItem('pairingHistory', JSON.stringify(pairingHistory));
  }, [pairingHistory]);

  useEffect(() => {
    localStorage.setItem('golfSeasons', JSON.stringify(seasons));
  }, [seasons]);

  useEffect(() => {
    if (currentSeason !== null) {
      localStorage.setItem('currentSeason', currentSeason);
    }
  }, [currentSeason]);

  const addPlayer = () => {
    if (newPlayerName.trim() && newPlayerHandicap !== '') {
      const trimmedName = newPlayerName.trim();
      const existingPlayerIndex = players.findIndex(
        p => p.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingPlayerIndex !== -1) {
        // Update existing player's handicap
        const updatedPlayers = [...players];
        updatedPlayers[existingPlayerIndex].handicap = parseFloat(newPlayerHandicap);
        setPlayers(updatedPlayers);
        setUploadError(`Updated handicap for ${trimmedName}`);
      } else {
        // Add new player
        const newPlayer = {
          id: Date.now(),
          name: trimmedName,
          handicap: parseFloat(newPlayerHandicap)
        };
        setPlayers([...players, newPlayer]);
      }
      setNewPlayerName('');
      setNewPlayerHandicap('');
    }
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError('');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        processCSVText(text);
        event.target.value = '';
      } catch (error) {
        setUploadError('Error reading file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };

  const processCSVText = (text) => {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header if it exists
      const startIndex = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('handicap') ? 1 : 0;
      
      const newPlayers = [];
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split by comma, handling quoted values
        const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
        
        if (parts.length >= 2) {
          const name = parts[0];
          const handicap = parseFloat(parts[1]);
          
          if (name && !isNaN(handicap)) {
            newPlayers.push({
              id: Date.now() + i + Math.random(),
              name: name,
              handicap: handicap
            });
          }
        }
      }
      
      if (newPlayers.length > 0) {
        setPlayers(newPlayers);
        setUploadError(`Success! Imported ${newPlayers.length} players (replaced existing roster)`);
        setCsvText('');
      } else {
        setUploadError('No valid players found in CSV. Format should be: Name, Handicap');
      }
    } catch (error) {
      setUploadError('Error processing CSV. Please check the format.');
    }
  };

  const handleTextImport = () => {
    if (!csvText.trim()) {
      setUploadError('Please enter CSV data');
      return;
    }
    setUploadError('');
    processCSVText(csvText);
  };

  const exportToCSV = () => {
    const csv = ['Name,Handicap', ...players.map(p => `${p.name},${p.handicap}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'golf_players.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAllPlayers = () => {
    console.log('Clear all clicked, players:', players.length);
    
    if (players.length === 0) {
      setUploadError('No players to clear');
      return;
    }
    
    setShowClearConfirm(true);
  };

  const confirmClearPlayers = () => {
    setPlayers([]);
    setCurrentTeams([]);
    setShowClearConfirm(false);
    setUploadError('All players have been cleared');
    setTimeout(() => setUploadError(''), 3000);
  };

  const clearHistory = () => {
    setShowClearHistoryConfirm(true);
  };

  const confirmClearHistory = () => {
    setWeeklyArchive([]);
    setPairingHistory({});
    setShowClearHistoryConfirm(false);
  };

  const saveCurrentSeason = () => {
    if (!seasonName.trim()) {
      alert('Please enter a season name');
      return;
    }

    const season = {
      id: Date.now(),
      name: seasonName.trim(),
      savedDate: new Date().toLocaleDateString(),
      archive: weeklyArchive,
      pairingHistory: pairingHistory,
      players: players
    };

    setSeasons([season, ...seasons]);
    setSeasonName('');
    setShowSaveSeasonModal(false);
    alert(`Season "${season.name}" saved successfully!`);
  };

  const loadSeason = (season) => {
    if (window.confirm(`Load season "${season.name}"? Current data will be replaced.`)) {
      setWeeklyArchive(season.archive || []);
      setPairingHistory(season.pairingHistory || {});
      setPlayers(season.players || []);
      setCurrentSeason(season.name);
      setActiveTab('history');
    }
  };

  const deleteSeason = (seasonId) => {
    setSeasons(seasons.filter(s => s.id !== seasonId));
  };

  const exportAllData = () => {
    const allData = {
      players: players,
      weeklyArchive: weeklyArchive,
      pairingHistory: pairingHistory,
      seasons: seasons,
      currentSeason: currentSeason,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golf-league-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importAllData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (data.players !== undefined) {
          if (window.confirm('This will replace all current data. Are you sure?')) {
            setPlayers(data.players || []);
            setWeeklyArchive(data.weeklyArchive || []);
            setPairingHistory(data.pairingHistory || {});
            setSeasons(data.seasons || []);
            setCurrentSeason(data.currentSeason || null);
            setCurrentTeams([]);
            alert('Data imported successfully!');
            event.target.value = '';
          }
        } else {
          alert('Invalid data file format');
        }
      } catch (error) {
        alert('Error reading file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const getPairingKey = (id1, id2) => {
    return [id1, id2].sort((a, b) => a - b).join('-');
  };

  const updatePairingHistory = (teams) => {
    const newHistory = { ...pairingHistory };
    
    teams.forEach(team => {
      for (let i = 0; i < team.length; i++) {
        for (let j = i + 1; j < team.length; j++) {
          const key = getPairingKey(team[i].id, team[j].id);
          newHistory[key] = (newHistory[key] || 0) + 1;
        }
      }
    });
    
    setPairingHistory(newHistory);
  };

  const generateTeams = () => {
    if (players.length < 4) {
      alert('Need at least 4 players to generate teams!');
      return;
    }

    if (players.length % 4 !== 0) {
      alert(`Cannot generate teams! You have ${players.length} players, but the number must be divisible by 4. Please add or remove ${4 - (players.length % 4)} player(s).`);
      return;
    }

    // Sort players by handicap (lowest to highest)
    const sortedPlayers = [...players].sort((a, b) => a.handicap - b.handicap);
    const numTeams = Math.floor(sortedPlayers.length / 4);
    const playingToday = sortedPlayers.slice(0, numTeams * 4);
    
    // Divide into A, B, C, D groups by quartiles
    const groupSize = numTeams;
    const aPlayers = playingToday.slice(0, groupSize);
    const bPlayers = playingToday.slice(groupSize, groupSize * 2);
    const cPlayers = playingToday.slice(groupSize * 2, groupSize * 3);
    const dPlayers = playingToday.slice(groupSize * 3, groupSize * 4);

    // Calculate pairing scores for optimization
    const getPairingScore = (p1, p2) => {
      const key = getPairingKey(p1.id, p2.id);
      return pairingHistory[key] || 0;
    };

    // Shuffle with optimization to minimize repeat pairings
    const shuffleWithOptimization = (arr) => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Try multiple random arrangements and pick the best
    let bestTeams = null;
    let bestScore = Infinity;

    for (let attempt = 0; attempt < 50; attempt++) {
      const shuffledA = shuffleWithOptimization(aPlayers);
      const shuffledB = shuffleWithOptimization(bPlayers);
      const shuffledC = shuffleWithOptimization(cPlayers);
      const shuffledD = shuffleWithOptimization(dPlayers);

      const teams = shuffledA.map((a, i) => [
        { ...a, position: 'A' },
        { ...shuffledB[i], position: 'B' },
        { ...shuffledC[i], position: 'C' },
        { ...shuffledD[i], position: 'D' }
      ]);

      // Calculate total pairing score (lower is better)
      let score = 0;
      teams.forEach(team => {
        for (let i = 0; i < team.length; i++) {
          for (let j = i + 1; j < team.length; j++) {
            score += getPairingScore(team[i], team[j]);
          }
        }
      });

      if (score < bestScore) {
        bestScore = score;
        bestTeams = teams;
      }
    }

    setCurrentTeams(bestTeams);
    setActiveTab('teams');
  };

  const saveWeek = () => {
    if (currentTeams.length === 0) return;
    
    const weekEntry = {
      date: new Date().toLocaleDateString(),
      teams: currentTeams
    };
    
    setWeeklyArchive([weekEntry, ...weeklyArchive]);
    updatePairingHistory(currentTeams);
    setCurrentTeams([]);
    alert('Teams saved to history!');
  };

  const getMostPlayedWith = (playerId) => {
    const counts = {};
    Object.keys(pairingHistory).forEach(key => {
      const [id1, id2] = key.split('-').map(Number);
      if (id1 === playerId) {
        counts[id2] = pairingHistory[key];
      } else if (id2 === playerId) {
        counts[id1] = pairingHistory[key];
      }
    });
    
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return sorted.map(([id, count]) => {
      const player = players.find(p => p.id === Number(id));
      return player ? { name: player.name, count } : null;
    }).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">Golf League Team Generator</h1>
              <p className="text-gray-600">Smart team generation with pairing history tracking</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportAllData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                title="Export all data"
              >
                <Download size={20} />
                Export
              </button>
              <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 cursor-pointer">
                <Upload size={20} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importAllData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Clear All Players?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove all {players.length} players? This cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearPlayers}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('players')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                activeTab === 'players'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users size={20} />
              Players ({players.length})
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                activeTab === 'teams'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Shuffle size={20} />
              Current Teams
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                activeTab === 'history'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <History size={20} />
              History ({weeklyArchive.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                activeTab === 'stats'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <TrendingUp size={20} />
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('seasons')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                activeTab === 'seasons'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FolderOpen size={20} />
              Seasons ({seasons.length})
            </button>
          </div>

          <div className="p-6">
            {/* Players Tab */}
            {activeTab === 'players' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4">Add Players</h2>
                  
                  {/* CSV Upload Section */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium mb-2 text-blue-900">Import from CSV</h3>
                    <p className="text-sm text-blue-700 mb-3">Upload a CSV file or paste CSV text with columns: Name, Handicap</p>
                    
                    {/* File Upload */}
                    <div className="flex gap-3 items-center mb-3">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                      />
                      <button
                        onClick={() => setShowTextInput(!showTextInput)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        {showTextInput ? 'Hide' : 'Paste'} Text
                      </button>
                      {players.length > 0 && (
                        <button
                          onClick={exportToCSV}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          Export CSV
                        </button>
                      )}
                    </div>

                    {/* Text Input */}
                    {showTextInput && (
                      <div className="mt-3">
                        <textarea
                          value={csvText}
                          onChange={(e) => setCsvText(e.target.value)}
                          placeholder="Paste CSV data here...&#10;Example:&#10;John Smith, 8.5&#10;Jane Doe, 12.3&#10;Bob Jones, 5.2"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                          rows="6"
                        />
                        <button
                          onClick={handleTextImport}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          Import Text
                        </button>
                      </div>
                    )}

                    {uploadError && (
                      <p className={`text-sm mt-2 ${uploadError.includes('Success') ? 'text-green-700' : 'text-red-700'}`}>
                        {uploadError}
                      </p>
                    )}
                  </div>

                  {/* Manual Entry */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Player Name"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Handicap"
                      value={newPlayerHandicap}
                      onChange={(e) => setNewPlayerHandicap(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                      className="w-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      step="0.1"
                    />
                    <button
                      onClick={addPlayer}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={generateTeams}
                      disabled={players.length < 4}
                      className="flex-1 mr-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Shuffle size={24} />
                      Generate Teams
                    </button>
                    {players.length > 0 && (
                      <button
                        onClick={clearAllPlayers}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
                      >
                        <Trash2 size={20} />
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-4">Player Roster</h2>
                <div className="space-y-2">
                  {players.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No players yet. Add some players to get started!</p>
                  ) : (
                    [...players]
                      .sort((a, b) => a.handicap - b.handicap)
                      .map((player, index) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-500 w-8">#{index + 1}</span>
                            <span className="font-medium">{player.name}</span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              HCP: {player.handicap}
                            </span>
                          </div>
                          <button
                            onClick={() => removePlayer(player.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div>
                {currentTeams.length === 0 ? (
                  <div className="text-center py-12">
                    <Shuffle size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No teams generated yet.</p>
                    <p className="text-gray-400 mt-2">Go to Players tab and click "Generate Teams"</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">This Week's Teams</h2>
                      <button
                        onClick={saveWeek}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Save to History
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentTeams.map((team, index) => (
                        <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
                          <h3 className="text-lg font-bold mb-4 text-green-800">Team {index + 1}</h3>
                          <div className="space-y-3">
                            {team.map((player) => (
                              <div key={player.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                    {player.position}
                                  </span>
                                  <span className="font-medium">{player.name}</span>
                                </div>
                                <span className="text-sm text-gray-600">HCP: {player.handicap}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Weekly Archive {currentSeason && `(${currentSeason})`}</h2>
                  <div className="flex gap-3">
                    {weeklyArchive.length > 0 && (
                      <>
                        <button
                          onClick={() => setShowSaveSeasonModal(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                        >
                          <Save size={16} />
                          Save as Season
                        </button>
                        <button
                          onClick={clearHistory}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Clear History
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {weeklyArchive.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No archived weeks yet.</p>
                ) : (
                  <div className="space-y-6">
                    {weeklyArchive.map((week, weekIndex) => (
                      <div key={weekIndex} className="border rounded-lg p-4">
                        <h3 className="font-bold mb-4 text-lg">Week of {week.date}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {week.teams.map((team, teamIndex) => (
                            <div key={teamIndex} className="bg-gray-50 rounded p-3">
                              <h4 className="font-medium mb-2 text-sm text-gray-600">Team {teamIndex + 1}</h4>
                              <div className="space-y-1 text-sm">
                                {team.map((player) => (
                                  <div key={player.id} className="flex justify-between">
                                    <span><strong>{player.position}:</strong> {player.name}</span>
                                    <span className="text-gray-500">{player.handicap}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Pairing Statistics</h2>
                {players.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Add players to see statistics.</p>
                ) : (
                  <div className="space-y-4">
                    {players.map((player) => {
                      const mostPlayed = getMostPlayedWith(player.id);
                      return (
                        <div key={player.id} className="border rounded-lg p-4">
                          <h3 className="font-bold mb-3">{player.name} <span className="text-sm font-normal text-gray-600">(HCP: {player.handicap})</span></h3>
                          {mostPlayed.length === 0 ? (
                            <p className="text-sm text-gray-500">No pairings yet</p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-600">Most played with:</p>
                              {mostPlayed.map((partner, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                                  <span className="text-sm">{partner.name}</span>
                                  <span className="text-sm font-medium text-green-600">{partner.count} times</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Seasons Tab */}
            {activeTab === 'seasons' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Saved Seasons</h2>
                {seasons.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No saved seasons yet. Save your current history as a season from the History tab.</p>
                ) : (
                  <div className="space-y-4">
                    {seasons.map((season) => (
                      <div key={season.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{season.name}</h3>
                            <p className="text-sm text-gray-600">Saved: {season.savedDate}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {season.archive?.length || 0} weeks • {season.players?.length || 0} players
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadSeason(season)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => deleteSeason(season.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save Season Modal */}
        {showSaveSeasonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Save Season</h3>
              <p className="text-gray-600 mb-4">
                Give this season a name to save all history and player data.
              </p>
              <input
                type="text"
                value={seasonName}
                onChange={(e) => setSeasonName(e.target.value)}
                placeholder="e.g., Spring 2024"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                onKeyPress={(e) => e.key === 'Enter' && saveCurrentSeason()}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowSaveSeasonModal(false);
                    setSeasonName('');
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentSeason}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Save Season
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear History Confirmation Modal */}
        {showClearHistoryConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Clear History?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to clear all weekly history and pairing statistics? This cannot be undone. Consider saving as a season first.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearHistoryConfirm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearHistory}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GolfLeagueManager;
