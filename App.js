import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Dimensions, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SW, height: SH } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 24;
const IS_TABLET = SW >= 600;

// Phone grid: 4 cols x 6 rows | Tablet grid: 6 cols x 4 rows
const COLS = IS_TABLET ? 6 : 4;
const ROWS = IS_TABLET ? 4 : 6;

// ── THEME ──
const C = {
  bg: '#0e0f11', sur: '#1a1b1f', s2: '#23252b', s3: '#2c2f38',
  b1: 'rgba(255,255,255,0.07)', b2: 'rgba(255,255,255,0.16)',
  txt: '#f0f0f0', mut: '#888', dim: '#484848',
  grn: '#1D9E75', gl: '#5DCAA5', gd: '#0a5c43',
  bld: '#185FA5', rdd: '#A32D2D',
};

// ── PHONE PATHS (4x6 grid) ──
const PHONE_PATHS = [
  [0,4,8,9,5,1],
  [3,2,6,10,11,15],
  [20,21,22,18,17,16,12],
  [23,19,18,22,21,20,16],
  [0,4,8,9,13,14,10,6],
  [3,7,6,2,1,5,9,8],
  [20,21,17,18,14,13,12,8,4],
  [23,19,15,14,18,22,21,20,16],
  [8,12,13,9,5,4,0,1,2,3],
  [15,11,10,14,13,17,18,19,23,22],
  [0,1,2,6,10,9,13,17,18,19,15],
  [3,7,6,2,1,0,4,5,9,10,14],
  [20,21,17,18,22,23,19,15,14,13,9,10],
  [23,22,21,20,16,17,13,12,8,4,5,1],
  [0,4,8,9,10,6,7,11,15,19,18,17,21],
  [3,7,11,15,14,13,12,8,4,5,1,2,6],
  [20,21,17,16,12,8,4,5,6,2,3,7,11,10],
  [23,19,18,17,13,9,5,6,2,1,0,4,8,12],
  [8,9,10,6,7,11,15,14,13,12,16,17,21,22,23],
  [15,19,23,22,18,17,13,12,8,4,5,9,10,6,2],
  [0,1,5,6,7,11,15,14,10,9,8,12,16,17,18,19],
  [3,7,11,10,14,15,19,23,22,18,17,21,20,16,12,13],
  [20,21,17,13,9,8,4,5,6,7,11,10,14,15,19,23,22],
  [23,19,15,11,10,6,7,3,2,1,5,9,13,14,18,17,21],
  [0,4,8,9,13,12,16,20,21,22,23,19,18,14,10,6,5,1],
  [3,7,11,10,6,5,9,8,12,13,17,16,20,21,22,18,19,23],
  [20,21,22,18,14,15,11,7,3,2,1,5,6,10,9,13,12,16,17],
  [23,22,21,20,16,12,13,9,8,4,5,6,10,14,18,19,15,11,7],
  [8,4,0,1,5,9,13,12,16,20,21,22,23,19,15,14,10,11,7,3],
  [15,14,18,22,21,20,16,17,13,12,8,4,0,1,5,6,7,11,10,9],
  [0,4,5,1,0,4,8,12,13,17,16,20,21,22,18,14,10,11,15,19,23],
  [3,2,1,0,1,0,4,8,9,5,6,10,11,15,19,23,22,21,17,13,12],
  [20,21,22,23,19,15,11,15,19,18,14,13,17,16,12,8,4,5,9,10,6,7],
  [23,19,23,19,15,14,13,17,21,20,16,12,8,9,5,6,10,11,7,3,2,1],
  [0,1,2,1,2,3,7,6,5,4,8,12,16,17,18,14,13,9,10,11,15,19,23],
  [3,7,6,2,1,2,1,0,1,5,6,10,9,8,12,13,14,18,22,21,20,16,17],
  [20,21,20,16,17,16,20,21,22,23,19,18,14,13,9,10,6,5,1,2,3,7,11,15],
  [23,19,23,22,21,20,16,17,21,22,18,19,15,14,10,6,2,1,0,4,8,12,13,9],
  [8,9,5,4,8,4,0,1,0,1,2,6,10,11,15,19,23,22,21,20,16,12,13,14,18],
  [15,14,15,11,10,6,5,1,0,4,0,4,5,9,8,12,16,20,21,22,23,19,18,17,13],
];

// ── TABLET PATHS (6x4 grid) ──
const TABLET_PATHS = [
  [0,6,12,13,7,1],
  [5,4,10,16,17,23],
  [18,19,20,14,13,12,6],
  [23,17,16,22,21,20,19],
  [0,6,12,13,19,20,14,8],
  [5,11,10,4,3,9,15,14],
  [18,19,13,14,8,7,6,0,1],
  [23,17,11,10,16,22,21,20,14],
  [9,8,2,3,4,10,16,15,14,13],
  [14,20,19,18,12,13,7,1,0,6],
  [0,1,2,8,14,13,19,20,21,22,16],
  [5,11,10,4,3,2,8,7,13,19,18],
  [18,19,13,14,20,21,15,9,8,7,1,2],
  [23,17,16,22,21,15,14,20,19,18,12,13],
  [0,6,12,13,14,8,9,15,21,22,16,17,11],
  [5,11,17,23,22,21,20,14,15,16,10,4,3],
  [18,12,13,7,6,0,1,2,8,9,3,4,5,11],
  [23,22,21,15,9,8,2,1,7,6,12,13,14,20],
  [9,8,7,1,2,3,4,10,16,15,21,22,23,17,11],
  [14,8,7,6,0,1,2,3,9,10,4,5,11,17,16],
  [0,6,7,8,14,13,19,20,21,15,9,3,4,10,11,5],
  [5,4,10,11,17,23,22,16,15,9,8,14,13,7,1,0],
  [18,19,13,14,15,16,22,23,17,11,5,4,3,2,8,7,6],
  [23,22,16,17,11,5,4,3,2,8,9,15,14,13,12,6,7],
  [0,6,7,13,12,18,19,20,21,15,14,8,2,3,9,10,16,22],
  [5,11,17,16,10,9,15,14,8,7,1,0,6,12,18,19,20,21],
  [18,19,13,7,6,0,1,2,3,9,8,14,15,21,22,23,17,11,10],
  [23,17,11,10,9,3,2,8,7,13,12,18,19,20,14,15,21,22,16],
  [9,3,4,10,16,17,23,22,21,15,14,20,19,18,12,13,7,6,0,1],
  [14,13,19,18,12,6,0,1,7,8,9,3,4,5,11,17,23,22,16,15],
  [0,6,7,1,0,6,12,18,19,20,14,8,2,3,9,15,21,22,16,10,4],
  [5,4,3,2,3,2,1,0,6,7,13,12,18,19,20,21,15,9,10,16,22],
  [18,19,20,21,15,16,22,16,17,23,17,11,5,4,10,9,3,2,8,14,13,7],
  [23,17,23,17,16,10,11,5,4,3,2,8,14,13,7,1,0,6,12,18,19,20],
  [0,6,7,8,7,13,14,13,12,18,19,20,21,15,9,3,4,5,11,17,23,22,16],
  [5,11,10,9,8,2,3,4,10,4,5,11,17,16,15,21,20,14,13,19,18,12,6],
  [18,12,13,14,8,9,3,4,10,11,17,23,17,16,15,16,22,21,20,14,13,7,1,0],
  [23,17,16,17,16,10,11,5,4,10,4,3,9,8,7,1,0,6,12,18,19,13,14,15],
  [9,10,11,5,4,5,4,5,11,17,23,22,16,15,14,13,7,1,0,6,12,18,19,20,21],
  [14,8,2,1,0,1,0,6,12,18,12,6,7,13,19,20,21,15,9,10,16,17,11,5,4],
];

const PATHS = IS_TABLET ? TABLET_PATHS : PHONE_PATHS;

const getSpeed = i => Math.round(1050 - (1050 - 650) * Math.sqrt(i / 39));
const spLabel = ms => ms >= 980 ? 'Very slow' : ms >= 870 ? 'Slow' : ms >= 770 ? 'Moderate' : ms >= 700 ? 'Fast' : 'Very fast';

function cellBg(state) {
  switch(state) {
    case 'head':  return C.grn;
    case 'trail': return '#0d4a35';
    case 'ok':    return '#0d2e52';
    case 'bad':   return '#3d1212';
    default:      return C.s2;
  }
}
function cellBorder(state) {
  switch(state) {
    case 'head':  return C.gl;
    case 'trail': return C.grn;
    case 'ok':    return C.bld;
    case 'bad':   return C.rdd;
    default:      return C.b1;
  }
}

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [lvl, setLvl]       = useState(0);
  const [lives, setLives]   = useState(3);
  const [phase, setPhase]   = useState('idle');
  const [cells, setCells]   = useState(Array(COLS * ROWS).fill('empty'));
  const [upath, setUpath]   = useState([]);
  const [replayed, setReplayed] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Tap Watch Path to begin');
  const [subInfo, setSubInfo]     = useState('');
  const [best, setBestState]      = useState(0);
  const [autoMsg, setAutoMsg]     = useState('');

  const timerRef    = useRef(null);
  const phaseRef    = useRef('idle');
  const upathRef    = useRef([]);
  const lvlRef      = useRef(0);
  const livesRef    = useRef(3);
  const replayedRef = useRef(false);

  useEffect(() => { phaseRef.current = phase; },    [phase]);
  useEffect(() => { upathRef.current = upath; },    [upath]);
  useEffect(() => { lvlRef.current = lvl; },        [lvl]);
  useEffect(() => { livesRef.current = lives; },    [lives]);
  useEffect(() => { replayedRef.current = replayed; }, [replayed]);

  useEffect(() => {
    AsyncStorage.getItem('pm_best').then(v => { if (v) setBestState(parseInt(v)); });
  }, []);

  const saveBest = async (l) => {
    const cur = parseInt(await AsyncStorage.getItem('pm_best') || '0');
    if (l > cur) { await AsyncStorage.setItem('pm_best', String(l)); setBestState(l); }
  };

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const resetGrid = () => setCells(Array(COLS * ROWS).fill('empty'));

  const setCell = useCallback((idx, state) => {
    setCells(prev => { const n = [...prev]; n[idx] = state; return n; });
  }, []);

  // ── START LEVEL ──
  const startLevel = useCallback((i, autoPlay) => {
    clearTimer();
    const ms = getSpeed(i);
    // Lives: 3 for lvl 1-20, 4 for lvl 21-30, 5 for lvl 31-40
    const maxLives = i < 20 ? 3 : i < 30 ? 4 : 5;
    setLvl(i); lvlRef.current = i;
    setLives(maxLives); livesRef.current = maxLives;
    setUpath([]); upathRef.current = [];
    setReplayed(false); replayedRef.current = false;
    resetGrid();
    setSubInfo(spLabel(ms) + ' · ' + PATHS[i].length + ' steps');

    if (autoPlay) {
      setAutoMsg('Level ' + (i + 1) + '  —  Watch!');
      setStatusMsg('');
      setPhase('watching'); phaseRef.current = 'watching';
      timerRef.current = setTimeout(() => { setAutoMsg(''); animate(i); }, 700);
    } else {
      setAutoMsg('');
      setStatusMsg('Tap Watch Path to begin');
      setPhase('idle'); phaseRef.current = 'idle';
    }
  }, []);

  // ── ANIMATE ──
  const animate = useCallback((lvlIdx) => {
    setCells(Array(COLS * ROWS).fill('empty'));
    const path = PATHS[lvlIdx];
    const ms = getSpeed(lvlIdx);
    let s = 0;
    setPhase('watching'); phaseRef.current = 'watching';
    setStatusMsg('Watch carefully...'); setSubInfo('');

    const tick = () => {
      if (s > 0) setCell(path[s - 1], 'trail');
      if (s < path.length) {
        setCell(path[s], 'head');
        s++;
        timerRef.current = setTimeout(tick, ms);
      } else {
        timerRef.current = setTimeout(() => {
          setCells(Array(COLS * ROWS).fill('empty'));
          beginDraw(lvlIdx);
        }, 700);
      }
    };
    tick();
  }, [setCell]);

  // ── DRAW PHASE ──
  const beginDraw = useCallback((lvlIdx) => {
    setPhase('drawing'); phaseRef.current = 'drawing';
    setUpath([]); upathRef.current = [];
    setStatusMsg('Trace the path!');
    setSubInfo('Tap each cell in order');
  }, []);

  // ── TAP ──
  const tapCell = useCallback((idx) => {
    if (phaseRef.current !== 'drawing') return;
    const path = PATHS[lvlRef.current];
    const up = upathRef.current;

    if (idx === path[up.length]) {
      const newUp = [...up, idx];
      setUpath(newUp); upathRef.current = newUp;
      setCell(idx, 'ok');

      if (newUp.length === path.length) {
        setPhase('done'); phaseRef.current = 'done';
        saveBest(lvlRef.current + 1);
        setStatusMsg('✓ Level ' + (lvlRef.current + 1) + ' complete!');
        setSubInfo('');
        if (lvlRef.current >= 39) {
          timerRef.current = setTimeout(() => setScreen('win'), 900);
        } else {
          timerRef.current = setTimeout(() => startLevel(lvlRef.current + 1, true), 1300);
        }
      }
    } else {
      const newLives = livesRef.current - 1;
      setLives(newLives); livesRef.current = newLives;
      setCell(idx, 'bad');
      timerRef.current = setTimeout(() => setCell(idx, 'empty'), 400);
      setStatusMsg('Wrong! ❤️ ' + newLives + ' left');
      if (newLives <= 0) {
        setPhase('over'); phaseRef.current = 'over';
        saveBest(lvlRef.current);
        timerRef.current = setTimeout(() => setScreen('over'), 800);
      }
    }
  }, [setCell, startLevel]);

  // ── REPLAY ──
  const doReplay = useCallback(() => {
    if (replayedRef.current || phaseRef.current !== 'drawing') return;
    setReplayed(true); replayedRef.current = true;
    animate(lvlRef.current);
  }, [animate]);

  // ── GRID DIMENSIONS ──
  const PADDING = 14;
  const GAP = 3;
  const GRID_PAD = 8;
  // On tablet, grid is wide (6x4) so use full width
  // On phone, grid is tall (4x6) so use full width
  const gridW = SW - PADDING * 2;
  const cellW = Math.floor((gridW - GRID_PAD * 2 - GAP * (COLS - 1)) / COLS);
  const cellH = cellW;
  const gridH = GRID_PAD * 2 + cellH * ROWS + GAP * (ROWS - 1);

  const progressPct = ((lvl + 1) / 40) * 100;

  // ── MENU ──
  if (screen === 'menu') {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View style={s.menuWrap}>
          <Text style={s.logo}>🧠</Text>
          <Text style={s.title}>Path Memory</Text>
          <Text style={s.subtitle}>Watch the snake trace a path.{'\n'}Memorize it. Then redraw it.</Text>
          {best > 0 && (
            <View style={s.bestBadge}>
              <Text style={s.bestTxt}>🏅 Best run: <Text style={s.bestVal}>Level {best} / 40</Text></Text>
            </View>
          )}
          <View style={s.rulesBox}>
            <Text style={s.rulesTxt}>
              {'❤️  3 lives (lvl 1-20) · 4 lives (lvl 21-30) · 5 lives (lvl 31-40)\n'}
              {'↺  1 free replay per level\n'}
              {'✗  Wrong tap = lose a life\n'}
              {'💀  0 lives = back to Level 1'}
            </Text>
          </View>
          <TouchableOpacity style={s.primaryBtn} onPress={() => { setScreen('game'); startLevel(0, false); }}>
            <Text style={s.primaryBtnTxt}>▶ Start Game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── GAME OVER ──
  if (screen === 'over') {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View style={s.modalWrap}>
          <View style={s.card}>
            <Text style={s.cardIcon}>💀</Text>
            <Text style={s.cardTitle}>Run Over</Text>
            <Text style={s.cardSub}>{'You reached Level ' + (lvl + 1) + ' of 40\nYour best: Level ' + best + ' / 40'}</Text>
            <TouchableOpacity style={s.primaryBtn} onPress={() => { setScreen('game'); startLevel(0, false); }}>
              <Text style={s.primaryBtnTxt}>↺ Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ghostBtn} onPress={() => setScreen('menu')}>
              <Text style={s.ghostBtnTxt}>← Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── WIN ──
  if (screen === 'win') {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View style={s.modalWrap}>
          <View style={s.card}>
            <Text style={s.cardIcon}>🏆</Text>
            <Text style={s.cardTitle}>You Did It!</Text>
            <Text style={s.cardSub}>{'All 40 levels completed.\nYou have an exceptional memory.'}</Text>
            <TouchableOpacity style={s.primaryBtn} onPress={() => { setScreen('game'); startLevel(0, false); }}>
              <Text style={s.primaryBtnTxt}>↺ Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.ghostBtn} onPress={() => setScreen('menu')}>
              <Text style={s.ghostBtnTxt}>← Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── GAME ──
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <ScrollView
        contentContainerStyle={[s.gameWrap, { paddingHorizontal: PADDING, paddingTop: STATUS_BAR_HEIGHT + 8 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* Top bar */}
        <View style={s.topbar}>
          <Text style={s.lvlLbl}>Level {lvl + 1} / 40</Text>
          <View style={s.heartsRow}>
            {Array.from({length: lvl < 20 ? 3 : lvl < 30 ? 4 : 5}, (_, i) => i + 1).map(n => (
              <Text key={n} style={[s.heart, n > lives && s.heartGone]}>❤️</Text>
            ))}
          </View>
        </View>

        {/* Progress */}
        <View style={s.progBg}>
          <View style={[s.progFill, { width: progressPct + '%' }]} />
        </View>
        <View style={s.progLbls}>
          <Text style={s.progTxt}>Start</Text>
          <Text style={s.progTxt}>Level 40</Text>
        </View>

        {/* Status */}
        <View style={s.statusArea}>
          <Text style={s.statusMsg}>{autoMsg || statusMsg}</Text>
          {!autoMsg && subInfo ? <Text style={s.subInfo}>{subInfo}</Text> : null}
        </View>

        {/* Grid — fills width */}
        <View style={[s.grid, { width: gridW, height: gridH, padding: GRID_PAD }]}>
          {cells.map((state, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={phase === 'drawing' ? 0.65 : 1}
              onPress={() => tapCell(idx)}
              style={[
                s.cell,
                {
                  width: cellW,
                  height: cellH,
                  marginRight: (idx % COLS) < COLS - 1 ? GAP : 0,
                  marginBottom: Math.floor(idx / COLS) < ROWS - 1 ? GAP : 0,
                  backgroundColor: cellBg(state),
                  borderColor: cellBorder(state),
                }
              ]}
            >
              {state === 'ok' && (
                <Text style={s.cellNum}>
                  {upathRef.current.lastIndexOf(idx) + 1}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Legend */}
        <View style={s.legend}>
          {[['#1D9E75','Snake'],['#378ADD','Your path'],['#E24B4A','Wrong (−1 ❤️)']].map(([color,label]) => (
            <View key={label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: color }]} />
              <Text style={s.legendTxt}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={s.btnRow}>
          <TouchableOpacity
            style={[s.replayBtn, (replayed || phase !== 'drawing') && s.btnDisabled]}
            onPress={doReplay}
            disabled={replayed || phase !== 'drawing'}
          >
            <Text style={s.btnTxt}>↺ Replay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.mainBtn, phase !== 'idle' && s.btnDisabled]}
            onPress={() => { if (phase === 'idle') animate(lvl); }}
            disabled={phase !== 'idle'}
          >
            <Text style={s.btnTxt}>
              {phase === 'idle' ? '▶  Watch Path' : phase === 'watching' || phase === 'replaying' ? 'Watching...' : 'Waiting...'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── STYLES ──
const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  menuWrap:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  logo:         { fontSize: 42 },
  title:        { fontSize: 26, fontWeight: '700', color: C.txt },
  subtitle:     { fontSize: 15, color: C.txt, textAlign: 'center', lineHeight: 22 },
  bestBadge:    { backgroundColor: C.s2, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 16, borderWidth: 0.5, borderColor: C.b2 },
  bestTxt:      { fontSize: 14, color: C.txt },
  bestVal:      { color: C.grn, fontWeight: '700' },
  rulesBox:     { backgroundColor: C.s2, borderRadius: 10, padding: 14, borderWidth: 0.5, borderColor: C.b1, width: '100%' },
  rulesTxt:     { fontSize: 13, color: C.txt, textAlign: 'center', lineHeight: 24 },
  primaryBtn:   { backgroundColor: C.gd, borderRadius: 12, height: 52, width: '100%', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: 'rgba(29,158,117,0.35)' },
  primaryBtnTxt:{ color: '#fff', fontSize: 16, fontWeight: '600' },
  ghostBtn:     { height: 40, alignItems: 'center', justifyContent: 'center', width: '100%' },
  ghostBtnTxt:  { color: C.mut, fontSize: 14 },
  modalWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card:         { backgroundColor: C.sur, borderRadius: 18, padding: 28, alignItems: 'center', gap: 14, width: '100%', maxWidth: 300, borderWidth: 0.5, borderColor: C.b2 },
  cardIcon:     { fontSize: 38 },
  cardTitle:    { fontSize: 20, fontWeight: '700', color: C.txt },
  cardSub:      { fontSize: 14, color: C.txt, textAlign: 'center', lineHeight: 22 },
  gameWrap:     { alignItems: 'center', paddingBottom: 20, gap: 6 },
  topbar:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  lvlLbl:       { fontSize: 14, color: C.txt, fontWeight: '600' },
  heartsRow:    { flexDirection: 'row', gap: 5 },
  heart:        { fontSize: 16 },
  heartGone:    { opacity: 0.1 },
  progBg:       { width: '100%', height: 3, backgroundColor: C.s2, borderRadius: 2, overflow: 'hidden' },
  progFill:     { height: '100%', backgroundColor: C.grn, borderRadius: 2 },
  progLbls:     { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  progTxt:      { fontSize: 11, color: C.mut },
  statusArea:   { height: 36, alignItems: 'center', justifyContent: 'center' },
  statusMsg:    { fontSize: 14, fontWeight: '600', color: C.txt, textAlign: 'center' },
  subInfo:      { fontSize: 12, color: C.mut, textAlign: 'center', marginTop: 2 },
  grid:         { backgroundColor: C.sur, borderRadius: 14, borderWidth: 0.5, borderColor: C.b1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start' },
  cell:         { borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cellNum:      { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  legend:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  legendItem:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:    { width: 8, height: 8, borderRadius: 2 },
  legendTxt:    { fontSize: 11, color: C.mut },
  btnRow:       { flexDirection: 'row', gap: 8, width: '100%' },
  replayBtn:    { height: 48, paddingHorizontal: 20, borderRadius: 12, borderWidth: 0.5, borderColor: C.b2, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
  mainBtn:      { flex: 1, height: 48, borderRadius: 12, borderWidth: 0.5, borderColor: C.b2, backgroundColor: C.s2, alignItems: 'center', justifyContent: 'center' },
  btnTxt:       { fontSize: 14, fontWeight: '600', color: C.txt },
  btnDisabled:  { opacity: 0.25 },
});
