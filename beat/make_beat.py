#!/usr/bin/env python3
"""
«Не пустослов» — минусовка в духе раннего Гуфа (boom-bap, 2000-е).
86 BPM, ля минор, грустное пиано + пыльные барабаны + винил.
Полностью синтезируется кодом (без чужих сэмплов). Детерминированно (seed).

python3 make_beat.py  ->  ne_pustoslov_beat.wav (+ mp3 через ffmpeg)
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import subprocess, os, wave

SR = 44100
BPM = 86
BEAT = 60.0 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
SWING = 0.56            # доля длительности «пары» шестнадцатых у первой ноты
rng = np.random.default_rng(1986)

# ---------------- аранжировка (такты) ----------------
# drums: full | half | sparse | none ; flags: piano, mel, bass, pad, lp (фильтр «через стену»)
SECTIONS = [
    ("Интро",          4, dict(drums="none",  piano=1, mel=1, bass=0, pad=0, lp=1)),
    ("Куплет 1",      16, dict(drums="full",  piano=1, mel=0, bass=1, pad=0, lp=0)),
    ("Припев",         8, dict(drums="full",  piano=1, mel=1, bass=1, pad=1, lp=0)),
    ("Куплет 2",      16, dict(drums="full",  piano=1, mel=0, bass=1, pad=0, lp=0)),
    ("Куплет 3",      16, dict(drums="full",  piano=1, mel=0, bass=1, pad=0, lp=0)),
    ("Припев",         8, dict(drums="full",  piano=1, mel=1, bass=1, pad=1, lp=0)),
    ("Куплет 4",      24, dict(drums="full",  piano=1, mel=0, bass=1, pad=0, lp=0)),
    ("Бридж",          8, dict(drums="half",  piano=1, mel=1, bass=1, pad=1, lp=0)),
    ("Припев x2",     16, dict(drums="full",  piano=1, mel=1, bass=1, pad=1, lp=0)),
    ("Аутро",          8, dict(drums="none",  piano=1, mel=1, bass=0, pad=1, lp=1)),
]
TOTAL_BARS = sum(s[1] for s in SECTIONS)
TAIL = 4.0
N = int((TOTAL_BARS * BAR + TAIL) * SR)

# ---------------- гармония: Am9 – Fmaj7 – Dm9 – E7(b9) ----------------
def m(n):  # имя ноты -> midi
    names = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
    return names[n[:-1]] + 12 * (int(n[-1]) + 1)
def hz(midi): return 440.0 * 2 ** ((midi - 69) / 12)

CHORDS = [
    dict(root=m('A1'), voicing=[m('C4'), m('E4'), m('G4'), m('B4')]),
    dict(root=m('F1'), voicing=[m('A3'), m('C4'), m('E4'), m('G4')]),
    dict(root=m('D2'), voicing=[m('F3'), m('A3'), m('C4'), m('E4')]),
    dict(root=m('E2'), voicing=[m('G#3'), m('B3'), m('D4'), m('F4')]),
]
# мелодия-«плач» (в 16-х от начала такта, длительность в 16-х)
MELODY = [
    [(0, 'E5', 6), (6, 'D5', 2), (8, 'C5', 8)],
    [(0, 'C5', 6), (6, 'B4', 2), (8, 'A4', 6), (14, 'G4', 2)],
    [(0, 'A4', 4), (4, 'C5', 4), (8, 'F5', 6), (14, 'E5', 2)],
    [(0, 'D5', 6), (6, 'B4', 2), (8, 'G#4', 8)],
]

# ---------------- утилиты ----------------
def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)
def t16(i):
    """время i-й шестнадцатой с учётом свинга"""
    pair, odd = divmod(i, 2)
    return pair * 2 * S16 + (odd * 2 * S16 * SWING)
def add(buf, x, t, gain=1.0):
    i = int(t * SR)
    if i < 0: x, i = x[-i:], 0
    j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += gain * x[: j - i]
def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))

# ---------------- барабаны ----------------
def kick():
    n = int(0.55 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    click = lp(rng.standard_normal(n), 3000) * np.exp(-t * 180) * 0.35
    x = np.tanh(2.2 * (body + click))
    return x / np.abs(x).max()
def snare():
    n = int(0.45 * SR); t = np.arange(n) / SR
    tone = (np.sin(2*np.pi*185*t) + 0.5*np.sin(2*np.pi*330*t)) * np.exp(-t * 22)
    noise = bp(rng.standard_normal(n), 1200, 7500) * np.exp(-t * 13)
    x = np.tanh(1.8 * (0.55 * tone + noise))
    x = lp(x, 6500)                       # «пыльный» верх
    return x / np.abs(x).max()
def hat(open_=False):
    n = int((0.32 if open_ else 0.07) * SR); t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 7000, 4) * np.exp(-t * (9 if open_ else 70))
    x = lp(x, 11000)
    return x / np.abs(x).max()
def rim():
    n = int(0.08 * SR); t = np.arange(n) / SR
    x = (np.sin(2*np.pi*1700*t) + bp(rng.standard_normal(n), 2000, 6000) * 0.6) * np.exp(-t * 60)
    return x / np.abs(x).max()
KICK, SNARE, HAT, OHAT, RIM = kick(), snare(), hat(), hat(True), rim()

# паттерны (шестнадцатые 0..15)
KICK_A  = {0: 1.0, 7: 0.75, 10: 0.9}
KICK_B  = {0: 1.0, 3: 0.55, 10: 0.9, 13: 0.6}     # каждый 4-й такт — вариация
SNARE_P = {4: 1.0, 12: 1.0}
GHOST   = {9: 0.18, 15: 0.14}
HATS    = {i: (0.55 if i % 4 == 0 else 0.38 if i % 2 == 0 else 0.2) for i in range(16)}

# ---------------- пиано (аддитивный синтез, лёгкая негармоничность) ----------------
_cache = {}
def piano(midi, dur, vel):
    key = (midi, round(dur, 2), round(vel, 1))
    if key in _cache: return _cache[key]
    f0 = hz(midi); B = 0.0004
    n = int((dur + 1.6) * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for k in range(1, 9):
        fk = f0 * k * np.sqrt(1 + B * k * k)
        if fk > 9000: break
        amp = (1.0 / k ** 1.25) * (1 + 0.6 * vel * (k > 2))
        tau = 2.4 / (1 + 0.55 * k) * (1.3 if midi < 60 else 1.0)
        x += amp * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6.28)) * np.exp(-t / tau)
    hammer = lp(rng.standard_normal(n), 2500) * np.exp(-t * 90) * 0.04
    x += hammer
    rel = np.ones(n); r0 = int(dur * SR)
    if r0 < n: rel[r0:] = np.exp(-np.arange(n - r0) / (0.18 * SR))
    atk = np.minimum(1, np.arange(n) / (0.004 * SR))
    x = x * rel * atk
    x = lp(x, 1800 + 3500 * vel)
    x *= vel / (np.abs(x).max() + 1e-9)
    _cache[key] = x
    return x

def rhodes(midi, dur, vel):
    f0 = hz(midi); n = int((dur + 1.2) * SR); t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * f0 * 1.0 * t) * (1.8 * np.exp(-t * 3))
    x = np.sin(2 * np.pi * f0 * t + mod) * np.exp(-t / 1.6)
    x *= 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)          # тремоло
    rel = np.ones(n); r0 = int(dur * SR)
    rel[r0:] = np.exp(-np.arange(n - r0) / (0.25 * SR))
    x *= rel * np.minimum(1, np.arange(n) / (0.006 * SR))
    return lp(x, 4000) * vel

def bass(midi, dur, vel):
    f0 = hz(midi); n = int((dur + 0.15) * SR); t = np.arange(n) / SR
    x = np.sin(2*np.pi*f0*t) + 0.25*np.sin(2*np.pi*2*f0*t) + 0.08*np.sin(2*np.pi*3*f0*t)
    e = np.minimum(1, np.arange(n) / (0.008 * SR)) * np.exp(-t * 1.6)
    r0 = int(dur * SR); e[r0:] *= np.exp(-np.arange(n - r0) / (0.04 * SR))
    return np.tanh(1.4 * x * e) * vel

def pad(midis, dur):
    n = int((dur + 1.5) * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for mi in midis:
        for det in (-0.09, 0.0, 0.11):
            f = hz(mi) * 2 ** (det / 12)
            ph = rng.uniform(0, 1)
            x += 2 * ((f * t + ph) % 1) - 1                 # пила
    x = lp(x, 1400, 4)
    e = np.minimum(1, t / 0.8); r0 = int(dur * SR)
    e[r0:] *= np.exp(-np.arange(n - r0) / (0.6 * SR))
    return x * e / len(midis) * 0.5

# ---------------- рендер ----------------
drums = np.zeros(N); keys = np.zeros(N); keys_lp = np.zeros(N)
melo = np.zeros(N); bs = np.zeros(N); pads = np.zeros(N); fx = np.zeros(N)
snare_send = np.zeros(N)

def jitter(): return rng.normal(0, 0.004)

bar_idx = 0
markers = []
for name, nbars, f in SECTIONS:
    markers.append((name, bar_idx * BAR))
    for b in range(nbars):
        T = bar_idx * BAR
        ch = CHORDS[bar_idx % 4]
        last_bar_of_section = (b == nbars - 1)
        # --- барабаны
        if f["drums"] in ("full", "half"):
            kp = KICK_B if (b % 4 == 3) else KICK_A
            if f["drums"] == "half": kp = {0: 1.0, 10: 0.7}
            sp = SNARE_P if f["drums"] == "full" else {8: 1.0}
            stop = last_bar_of_section and SECTIONS.index((name, nbars, f)) < len(SECTIONS) - 1
            for i in range(16):
                ti = T + t16(i) + jitter()
                if stop and i >= 12:          # брейк: последняя доля перед новой частью — тишина
                    continue
                if i in kp: add(drums, KICK, ti, 0.95 * kp[i])
                if i in sp:
                    add(drums, SNARE, ti, 0.8 * sp[i]); add(snare_send, SNARE, ti, 0.8)
                if f["drums"] == "full" and i in GHOST: add(drums, SNARE, ti, GHOST[i])
                if f["drums"] == "full":
                    if i == 14 and b % 2 == 1: add(drums, OHAT, ti, 0.22)
                    elif i in HATS: add(drums, HAT, ti, HATS[i] * rng.uniform(0.8, 1.1) * 0.55)
                else:
                    if i % 4 == 2: add(drums, RIM, ti, 0.22)
                    if i % 2 == 0: add(drums, HAT, ti, 0.18)
            if stop:   # «засос» перед новой частью — обратная тарелка
                n = int(BEAT * SR); sw = lp(hp(rng.standard_normal(n), 3000), 9000) * np.linspace(0, 1, n) ** 3
                add(fx, sw, T + 3 * BEAT, 0.07)
        # --- пиано: аккорд на 1 и на «и» второй доли, верхний голос повторяет
        if f["piano"]:
            tgt = keys_lp if f["lp"] else keys
            v = 0.55 if f["drums"] != "half" else 0.45
            for k_, mi in enumerate(ch["voicing"]):
                add(tgt, piano(mi, 1.45 * BEAT, v), T + k_ * 0.012 + jitter(), 1.0)
            for k_, mi in enumerate(ch["voicing"][1:]):
                add(tgt, piano(mi, 1.2 * BEAT, v * 0.7), T + t16(6) + k_ * 0.01 + jitter(), 1.0)
            add(tgt, piano(ch["voicing"][-1] + 12, 0.5 * BEAT, v * 0.5), T + t16(11) + jitter())
            add(tgt, piano(ch["voicing"][-2], 0.9 * BEAT, v * 0.6), T + t16(12) + jitter())
            add(tgt, piano(ch["root"] + 24, 3.6 * BEAT, 0.5), T + jitter())     # левая рука
        # --- мелодия (rhodes) в припевах/интро/бридже/аутро
        if f["mel"]:
            for s, note, d in MELODY[bar_idx % 4]:
                add(melo, rhodes(m(note), d * S16 * 0.95, 0.5), T + t16(s) + jitter())
        # --- бас по бочке
        if f["bass"]:
            kp = KICK_B if (b % 4 == 3) else KICK_A
            if f["drums"] == "half": kp = {0: 1.0, 10: 0.7}
            hits = sorted(kp)
            for j, i in enumerate(hits):
                nxt = hits[j + 1] if j + 1 < len(hits) else 16
                note = ch["root"] + 12 + (7 if (i == 13) else 0)
                add(bs, bass(note, (nxt - i) * S16 * 0.9, 0.75 * kp[i]), T + t16(i))
        # --- пэд/струнные
        if f["pad"]:
            add(pads, pad([ch["root"] + 24] + ch["voicing"][:3], BAR), T)
        bar_idx += 1
# финальный аккорд в хвосте
add(keys_lp, piano(m('A2'), 3.0, 0.5), TOTAL_BARS * BAR)
for mi in CHORDS[0]["voicing"]:
    add(keys_lp, piano(mi, 3.0, 0.45), TOTAL_BARS * BAR + 0.02)

# ---------------- обработка и сведение ----------------
def reverb(x, secs=2.2, damp=4500):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (0.32 * SR))
    ir = lp(ir, damp); ir /= np.sqrt((ir ** 2).sum())
    return fftconvolve(x, ir)[: len(x)]

keys_all = keys + lp(keys_lp, 900, 4) * 1.6                 # интро/аутро — «из соседней комнаты»
keys_all = np.tanh(1.3 * keys_all) * 0.8                    # лёгкая плёночная сатурация
# wow/flutter: медленное «плавание» тона, как у старого сэмпла
tt = np.arange(N) / SR
warp = tt + 0.0018 * np.sin(2 * np.pi * 0.55 * tt) + 0.0004 * np.sin(2 * np.pi * 5.3 * tt)
keys_all = np.interp(warp * SR, np.arange(N), keys_all)
keys_all = hp(lp(keys_all, 6000), 120)

melo = hp(melo, 250)
pads = hp(pads, 200)
mix_wet = reverb(0.35 * keys_all + 0.6 * melo + 0.5 * pads + 0.25 * snare_send)

# сайдчейн бочкой для пиано/пэда (лёгкое «дыхание» boom-bap)
kick_env = np.abs(drums.copy())
kick_env = lp(kick_env, 8)
kick_env = 1 - 0.35 * np.clip(kick_env / (kick_env.max() + 1e-9) * 2.5, 0, 1)

drums_bus = np.tanh(1.5 * drums) * 0.75
drums_bus = lp(drums_bus, 9000)

# винил: треск + шорох
crack = np.zeros(N)
idx = rng.choice(N, size=int(N / SR * 9), replace=False)
crack[idx] = rng.uniform(-1, 1, len(idx)) * rng.uniform(0.2, 1.0, len(idx))
crack = bp(crack, 800, 6000) * 0.35 + lp(rng.standard_normal(N), 4000) * 0.004
crack = hp(crack, 300)

mono = (drums_bus * 0.95
        + keys_all * kick_env * 0.55
        + melo * 0.33
        + bs * 0.6
        + pads * kick_env * 0.28
        + mix_wet * 0.22
        + fx
        + crack * 0.6)

# стерео: пиано/реверб слегка разведены, барабаны и бас по центру
left  = mono + 0.08 * keys_all + 0.06 * mix_wet - 0.04 * melo
right = mono - 0.08 * keys_all + 0.06 * np.roll(mix_wet, 441) + 0.04 * melo
st = np.stack([left, right], 1)

# fade-out аутро
fo0 = int((TOTAL_BARS - 6) * BAR * SR)
fade = np.ones(N); fade[fo0:] = np.linspace(1, 0, N - fo0) ** 1.5
st *= fade[:, None]
fi = int(0.05 * SR); st[:fi] *= np.linspace(0, 1, fi)[:, None]

# мастер: мягкий лимитер
st = st / (np.abs(st).max() + 1e-9) * 1.1
st = np.tanh(st) / np.tanh(1.1) * 0.79   # ~-2 dBFS пик, запас под вокал

here = os.path.dirname(os.path.abspath(__file__))
wav_path = os.path.join(here, "ne_pustoslov_beat.wav")
with wave.open(wav_path, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
mp3_path = wav_path[:-4] + ".mp3"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path,
                "-codec:a", "libmp3lame", "-b:a", "256k", mp3_path], check=True)

def fmt(s): return f"{int(s // 60)}:{s % 60:05.2f}"
print(f"{BPM} BPM, такт = {BAR:.3f} с, всего {TOTAL_BARS} тактов, {fmt(N / SR)}")
for nm, t0 in markers: print(f"  {fmt(t0)}  {nm}")
