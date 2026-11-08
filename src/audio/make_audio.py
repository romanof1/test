"""Музыка и звуковой дизайн для фрагмента «Кто плыл через океан» — синтез на numpy (без внешних сервисов).
Выход: assets/audio/music.wav, sfx.wav, mix.wav (48 кГц, стерео) и assets/audio/accents.yaml.
Музыка — характер английского консорта начала XVII в.: виола, лютня, флейта, орган, рамочный барабан.
Озвучки пока нет: музыка сведена на «полный» уровень; под голос нужен ducking −10…−14 дБ (см. mix_vo.py).
"""
import numpy as np, wave, os
SR = 48000; DUR = 58.0; N = int(SR * DUR)
rs = np.random.RandomState(1620)
music = np.zeros((N, 2)); sfx = np.zeros((N, 2))
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(n): return np.arange(n) / SR
def put(buf, t0, sig, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N: return
    if i0 < 0: sig = sig[-i0:]; i0 = 0
    n = min(len(sig), N - i0)
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[i0:i0 + n, 0] += sig[:n] * gain * l * 1.4142; buf[i0:i0 + n, 1] += sig[:n] * gain * r * 1.4142
def env_adsr(n, a, d, s, r):
    e = np.ones(n) * s; A = int(a * SR); D = int(d * SR); R = int(r * SR)
    A = min(A, n); e[:A] = np.linspace(0, 1, A, endpoint=False) if A else e[:A]
    D2 = min(D, max(0, n - A)); e[A:A + D2] = np.linspace(1, s, D2, endpoint=False) if D2 else e[A:A + D2]
    if R and n > R: e[-R:] *= np.linspace(1, 0, R)
    return e
def spectral_filter(x, lo=None, hi=None, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); H = np.ones_like(f)
    if hi: H *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo: H *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * H, len(x))
def noise(n): return rs.randn(n)

# ---------------- инструменты ----------------
def lute(f, dur=1.6, vel=1.0):
    n = int(dur * SR); t = tt(n); s = np.zeros(n)
    for k in range(1, 9):
        s += (1 / k ** 1.1) * np.sin(2 * np.pi * f * k * (1 + .0007 * k * k) * t) * np.exp(-t * (2.2 + 1.1 * k))
    s *= np.minimum(1, t / .003); return s * vel * .5
def viol(f, dur, vel=1.0, att=.18):
    n = int((dur + .35) * SR); t = tt(n)
    vib = 1 + .0045 * np.sin(2 * np.pi * 5.3 * t + rs.rand() * 6) * np.minimum(1, t / .4)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR; s = np.zeros(n)
    for k in range(1, 12): s += (1 / k) * np.sin(k * ph) * (0.82 ** k)
    s += .015 * spectral_filter(noise(n), 800, 5000)   # шум смычка
    return s * env_adsr(n, att, .2, .8, .35) * vel * .32
def flute(f, dur, vel=1.0):
    n = int((dur + .2) * SR); t = tt(n)
    vib = 1 + .006 * np.sin(2 * np.pi * 5.0 * t) * np.minimum(1, t / .3)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    s = np.sin(ph) + .22 * np.sin(2 * ph) + .06 * np.sin(3 * ph) + .05 * spectral_filter(noise(n), 1500, 7000)
    return s * env_adsr(n, .06, .1, .85, .2) * vel * .28
def organ(f, dur, vel=1.0):
    n = int((dur + .4) * SR); t = tt(n)
    s = sum(a * np.sin(2 * np.pi * f * m * t) for m, a in [(1, 1), (2, .5), (3, .18), (4, .22), (.5, .35)])
    return s * env_adsr(n, .25, .1, .9, .4) * vel * .14
def drum(f=70, dur=.9, vel=1.0, bright=.3):
    n = int(dur * SR); t = tt(n)
    fr = f * (1 + .8 * np.exp(-t * 30)); s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 5)
    s += bright * spectral_filter(noise(n), 100, 1800) * np.exp(-t * 28)
    return s * vel
def bell(f, dur=3.0, vel=1.0):
    n = int(dur * SR); t = tt(n)
    s = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * d) for m, a, d in [(1, 1, 1.2), (2.76, .5, 2), (5.4, .3, 3.5), (8.93, .15, 5), (.5, .4, .8)])
    return s * np.minimum(1, t / .002) * vel * .3
def chord_tones(root, kind='m'):
    third = 3 if kind == 'm' else 4; return [root, root + third, root + 7]

# ---------------- партитура ----------------
B = .8  # доля при 75 BPM
# A · 0–3.6: «рекламная» светлая флейта в ре мажоре — обрывается на разрыве открытки
for i, (m, d) in enumerate([(74, .5), (78, .5), (81, 1), (79, .5), (78, .5), (76, .5), (78, .6)]):
    t0 = .25 + sum(x[1] for x in [(74, .5), (78, .5), (81, 1), (79, .5), (78, .5), (76, .5), (78, .6)][:i]) * B * .75
    if t0 < 3.55: put(music, t0, flute(mtof(m), min(d * B * .75, 3.58 - t0)), .9, .15)
for k in range(9):
    t0 = .25 + k * .4
    if t0 < 3.5: put(music, t0, lute(mtof([50, 57, 62, 66][k % 4]), 1.0), .7, -.2)
music[int(3.58 * SR):int(3.62 * SR)] *= np.linspace(1, 0, int(3.62 * SR) - int(3.58 * SR))[:, None]
music[int(3.62 * SR):int(4.6 * SR)] = 0   # тишина-обрыв: только звук бумаги
# B · 3.6–7.0: низкий бурдон виолы, нарастание к подъёму в облака
put(music, 3.75, viol(mtof(38), 3.4, .9, att=.6), .9, -.1); put(music, 3.85, viol(mtof(45), 3.3, .6, att=.8), .8, .1)
put(music, 5.6, viol(mtof(57), 1.5, .6, att=.9), .7, .2); put(music, 6.2, viol(mtof(62), .9, .6, att=.5), .7, -.2)
# C · 7.0–19.0: основная тема (ре минор), лютня-остинато, рамочный барабан
THEME = [(74, 1), (77, .5), (76, .5), (74, 1), (69, 1), (70, 1), (72, .5), (74, .5), (69, 2)]
ANSWER = [(70, 1), (69, .5), (67, .5), (65, 1), (67, 1), (69, 1.5), (67, .5), (62, 2)]
def play_line(line, t0, inst, gain, pan=0, oct=0, stop=None):
    t = t0
    for m, d in line:
        if stop and t >= stop: break
        dd = d * B if not stop else min(d * B, stop - t)
        put(music, t, inst(mtof(m + oct), dd * .95), gain, pan); t += d * B
    return t
CH_C = [(7.0, 50, 'm'), (8.6, 50, 'm'), (10.2, 46, 'M'), (11.8, 45, 'M'), (13.4, 46, 'M'), (15.0, 43, 'm'), (16.6, 45, 'M'), (17.4, 50, 'm')]
def arps(chords, end, gain=.55, pan=-.25, step=.4):
    for j, (t0, root, kind) in enumerate(chords):
        t1 = chords[j + 1][0] if j + 1 < len(chords) else end
        tones = chord_tones(root, 'm' if kind == 'm' else 'M'); pat = [tones[0], tones[1] + 12, tones[2], tones[1] + 12]
        k = 0; t = t0
        while t < t1 - .05: put(music, t, lute(mtof(pat[k % 4]), 1.2, .9 if k % 4 == 0 else .7), gain, pan); t += step; k += 1
def bass(chords, end, gain=.5):
    for j, (t0, root, kind) in enumerate(chords):
        t1 = chords[j + 1][0] if j + 1 < len(chords) else end
        put(music, t0, viol(mtof(root - 12), t1 - t0, .9, att=.12), gain, 0)
arps(CH_C, 19.0); bass(CH_C, 19.0, .45)
play_line(THEME, 7.0, viol, .8, .1); play_line(ANSWER, 13.4, viol, .8, .1, stop=19.0)
for k in range(15):
    t0 = 7.0 + k * B
    if t0 < 18.9: put(music, t0, drum(78 if k % 2 == 0 else 95, .5, .5 if k % 2 == 0 else .28, .4), .55, 0)
# акценты-удары грузов (литавра + в конце — колокол)
for t0, g in [(9.5, .8), (11.5, .9), (14.5, 1.25)]: put(music, t0, drum(52, 1.6, g, .25), 1.0, 0)
put(music, 14.5, bell(mtof(50), 4.0), .9, 0)
# D · 19.0–25.5: хорал органа в миноре, двери — удар
CH_D = [(19.0, 50, 'm'), (20.6, 43, 'm'), (22.2, 50, 'm'), (23.8, 45, 'M')]
for j, (t0, root, kind) in enumerate(CH_D):
    t1 = CH_D[j + 1][0] if j + 1 < len(CH_D) else 25.5
    for m in chord_tones(root + 12, kind) + [root]: put(music, t0, organ(mtof(m), t1 - t0), .9, 0)
put(music, 22.15, drum(48, 1.8, 1.0, .4), 1.0, 0)
put(music, 23.8, viol(mtof(57), 1.7, .7), .6, .2)
# E · 25.5–31.5: «надежда» — фа мажор, флейта и лютня; посадка у побережья — колокольчик
CH_E = [(25.5, 53, 'M'), (27.1, 48, 'M'), (28.7, 46, 'M'), (30.3, 53, 'M')]
arps(CH_E, 31.3, .5, -.2); bass(CH_E, 31.3, .4)
HOPE = [(69, .5), (72, .5), (77, 1), (76, .5), (74, .5), (72, 1), (70, .5), (69, .5), (67, .5), (69, .5), (72, 2.5)]
play_line(HOPE, 25.9, flute, .9, .2, stop=31.3)
put(music, 29.55, bell(mtof(81), 2.2, .6), .5, -.3); put(music, 29.8, bell(mtof(84), 2.2, .6), .5, .3)
# F · 31.5–36.5: одна виола в низком регистре
for t0, m, d in [(31.7, 50, 1.6), (33.3, 53, 1.2), (34.5, 52, .8), (35.3, 50, 1.3)]: put(music, t0, viol(mtof(m), d, .8, att=.3), .75, 0)
put(music, 31.6, viol(mtof(38), 4.9, .7, att=1.0), .6, 0)
# G · 36.5–49.3: тема возвращается полностью, с барабаном, нарастание; строй — 46.5
CH_G = [(36.5, 50, 'm'), (38.1, 50, 'm'), (39.7, 46, 'M'), (41.3, 45, 'M'), (42.9, 46, 'M'), (44.5, 43, 'm'), (46.1, 45, 'M'), (47.7, 50, 'm')]
arps(CH_G, 49.3, .55, -.25); bass(CH_G, 49.3, .5)
play_line(THEME, 36.5, viol, .85, .1); play_line(THEME, 36.5, flute, .5, .3, oct=12)
play_line(ANSWER, 42.9, viol, .9, .1); play_line(ANSWER, 42.9, flute, .55, .3, oct=12)
for k in range(32):
    t0 = 36.5 + k * B / 2
    if t0 < 49.2: put(music, t0, drum(78 if k % 4 == 0 else 110, .4, (.55 if k % 4 == 0 else .18) * (1 + (t0 - 36.5) / 20), .45), .5, 0)
put(music, 46.5, drum(55, 1.4, 1.0, .3), .9, 0)
# H · 49.3–58: восходящая секвенция → ре мажор (пикардийская терция) на волне заливки 52.0 → разрешение
for i, m in enumerate([69, 70, 72, 74, 76, 77, 79]): put(music, 49.3 + i * .38, flute(mtof(m), .4), .7, .2); put(music, 49.3 + i * .38, viol(mtof(m - 12), .4), .55, -.1)
for m in [38, 50, 54, 57, 62, 66, 69]: put(music, 52.0, viol(mtof(m), 3.2, .85, att=.08), .55, (m % 5 - 2) * .15)
put(music, 52.0, drum(50, 2.2, 1.2, .35), 1.0, 0); put(music, 52.0, bell(mtof(62), 5.0), .7, 0)
for t0, root, kind in [(55.2, 43, 'M'), (56.0, 45, 'M')]:
    for m in chord_tones(root + 12, kind): put(music, t0, viol(mtof(m), .8, .6), .45, 0)
arps([(55.2, 43, 'M'), (56.0, 45, 'M')], 56.8, .45, -.2)
for m in [50, 57, 62, 66]: put(music, 56.8, viol(mtof(m), 1.1, .7, att=.3), .55, 0)
put(music, 56.8, lute(mtof(62), 1.2), .6, 0)

# ---------------- звуковой дизайн ----------------
def nz(dur, lo=None, hi=None): return spectral_filter(noise(int(dur * SR)), lo, hi)
def shaped(x, a=.01, r=.1):
    n = len(x); return x * env_adsr(n, a, .01, 1, min(r, n / SR * .9))
def paper_tear(dur=.4):
    n = int(dur * SR); x = nz(dur, 1200, 7000); crack = (rs.rand(n) < .004).astype(float); crack = spectral_filter(crack, 2000, 9000) * 12
    return (x * .4 + crack) * np.exp(-tt(n) * 3) * env_adsr(n, .005, .01, 1, .05)
def rustle(dur=.5, g=1): x = nz(dur, 1500, 6000) * (0.6 + .4 * np.sin(2 * np.pi * 9 * tt(int(dur * SR)) + 1)) ; return shaped(x, .03, .2) * g
def thud(f=60, dur=.6, g=1, br=.6):
    n = int(dur * SR); t = tt(n); s = np.sin(2 * np.pi * np.cumsum(f * (1 + np.exp(-t * 40))) / SR) * np.exp(-t * 9)
    return (s + br * nz(dur, 80, 900) * np.exp(-t * 25)) * g
def whoosh(dur, g=1, lo=200, hi=3000, rise=True):
    n = int(dur * SR); t = tt(n); x = nz(dur, lo, hi); e = np.sin(np.pi * t / dur) ** 2
    if rise: e = (t / dur) ** 2 * (1 - np.exp(-(dur - t) * 20))
    return x * e * g
def creak(dur=.6, f=180, g=1):
    n = int(dur * SR); t = tt(n); fr = f * (1 + .25 * np.sin(2 * np.pi * 1.5 * t)); ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sign(np.sin(ph)) * (rs.rand(n) < .35); s = spectral_filter(s, 300, 2500)
    return s * np.sin(np.pi * t / dur) * g * .6
def metal(f, dur=1.2, g=1):
    n = int(dur * SR); t = tt(n); return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * d) for m, a, d in [(1, 1, 4), (2.4, .6, 6), (3.9, .4, 9), (5.6, .3, 12)]) * g * .4
def blip(f=900, dur=.12, g=1):
    n = int(dur * SR); t = tt(n); return np.sin(2 * np.pi * np.cumsum(f * (1.6 - t / dur * .8)) / SR) * np.exp(-t * 35) * g
def gull(g=1):
    dur = .5; n = int(dur * SR); t = tt(n); fr = 1700 + 500 * np.sin(np.pi * t / dur) ** 2
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * t / dur) ** 3 * g * .25
def ambience(t0, t1, lo, hi, g, mod=.2, rate=.15):
    n = int((t1 - t0) * SR); t = tt(n); x = spectral_filter(noise(n), lo, hi) * (1 - mod + mod * np.sin(2 * np.pi * rate * t + rs.rand() * 6))
    x *= env_adsr(n, .4, .1, 1, .5); put(sfx, t0, x, g, 0)
# 001 гавань
ambience(0, 7.0, 100, 900, .10, .4, .12)
for t0 in [.6, 1.9, 4.9, 6.1]: put(sfx, t0, gull(), .5, rs.rand() - .5)
for k in range(15): put(sfx, .2 + k * .45, thud(140, .15, .12, 1.2), .35, .3)       # шаги очереди по доскам
put(sfx, 3.3, creak(.3, 260, .8), .5, 0)                                           # натяжение бумаги
put(sfx, 3.6, paper_tear(.45), .55, 0)
put(sfx, 3.75, whoosh(.8, .25, 300, 2500, False), .7, -.5); put(sfx, 3.8, whoosh(.8, .25, 300, 2500, False), .7, .5)
put(sfx, 4.55, rustle(.25, .3), .5, .3)                                            # жест
put(sfx, 5.9, whoosh(1.15, .55, 150, 2200, True), .9, 0)                           # подъём в облака
# 002 карта
put(sfx, 7.0, whoosh(1.2, .35, 200, 3000, False), .7, 0)
put(sfx, 7.12, thud(160, .1, .2), .4, 0); put(sfx, 7.17, thud(90, .5, .9, .4), .7, 0)   # медальон: подготовка + pop
put(sfx, 9.05, whoosh(.45, .4, 400, 4000, True), .6, -.2); put(sfx, 9.5, thud(70, .7, 1.0, .9), .9, -.2)          # столб — дерево
put(sfx, 11.05, whoosh(.45, .4, 600, 5000, True), .6, .2); put(sfx, 11.5, rustle(.3, 1.2), .8, .2); put(sfx, 11.52, thud(110, .3, .6, .5), .6, .2)  # расписка + печать
put(sfx, 14.05, whoosh(.45, .5, 300, 3000, True), .7, 0); put(sfx, 14.5, thud(45, 1.2, 1.3, 1.0), 1.0, 0)     # шпиль — камень
for t0 in [9.7, 11.7, 14.7]: put(sfx, t0, nz(1.4, 2000, 6000) * np.linspace(1, 0, int(1.4 * SR)) * .12, .7, -.3)  # скольжение фигурок
put(sfx, 17.3, whoosh(1.7, .55, 200, 4000, True), .9, 0)                           # нырок к шпилю
# 003 собор
ambience(19.0, 25.5, 150, 1200, .06, .2, .1)
put(sfx, 19.4, rustle(.6, .8), .7, -.4); put(sfx, 23.3, rustle(.4, .6), .5, -.4)  # свиток
put(sfx, 22.15, thud(55, 1.0, 1.2, 1.2), 1.0, 0); put(sfx, 22.15, creak(.6, 140, 1.0), .8, 0)   # двери распахнулись
for k in range(10): put(sfx, 22.35 + k * .28, thud(170, .12, .2, 1.4), .45, -.2)  # шаги/шарканье
put(sfx, 23.27, thud(200, .2, .5, 1.0), .6, -.1)                                  # книга о камень
put(sfx, 24.85, whoosh(.7, .6, 300, 3500, True), .9, -.3)                          # проезд влево
# 004 порт и перелёт
ambience(25.5, 27.8, 150, 1500, .06)
for k in range(6): put(sfx, 25.5 + k * .3, thud(150, .12, .25, 1.2), .4, .4)       # шаги ведущего
put(sfx, 27.7, whoosh(.7, .45, 500, 4000, True), .7, 0); put(sfx, 28.1, rustle(.5, .5), .5, 0)
put(sfx, 28.1, whoosh(1.9, .45, 150, 2000, False), .8, 0)                          # ветер перелёта
put(sfx, 29.55, blip(800, .12), .35, -.3); put(sfx, 29.8, blip(950, .12), .35, .3)
put(sfx, 31.1, whoosh(.45, .6, 200, 3000, True), .9, 0); put(sfx, 31.5, nz(.8, 200, 3000) * np.exp(-tt(int(.8 * SR)) * 5) * .7, .9, 0)  # всплеск
# 005 шторм
n = int((39.5 - 31.5) * SR); tq = tt(n); calm = np.clip((tq - (36.3 - 31.5)) / 2.3, 0, 1)
storm = spectral_filter(noise(n), 100, 1200) * (.6 + .4 * np.sin(2 * np.pi * .13 * tq)) * (1 - .85 * calm)
wind = spectral_filter(noise(n), 400, 1800) * (.5 + .5 * np.sin(2 * np.pi * .21 * tq + 1)) ** 2 * (1 - .9 * calm)
rain = spectral_filter(noise(n), 3000, 9000) * (1 - calm) * .5
put(sfx, 31.5, (storm * .5 + wind * .4 + rain * .25) * env_adsr(n, .3, .1, 1, .5), 1.15, 0)
for t0 in [32.2, 33.9, 35.6]: put(sfx, t0, nz(1.6, 80, 700) * np.sin(np.pi * tt(int(1.6 * SR)) / 1.6) ** 2 * .9, 1.0, rs.rand() - .5)   # удары волн
for t0 in [32.6, 34.4, 36.0, 37.7]: put(sfx, t0, creak(.9, 120 + rs.rand() * 60, .8), .45, rs.rand() - .5)   # скрип корпуса
for t0 in [32.75, 33.15]: put(sfx, t0, nz(.18, 300, 2000) * np.exp(-tt(int(.18 * SR)) * 20), .12, -.1)   # кашель — очень тихо
for t0 in [38.2, 38.9]: put(sfx, t0, gull(), .35, .4)
# 006 палуба
ambience(39.5, 48.5, 100, 800, .07, .3, .2)
for t0 in [40.6, 44.2, 47.0]: put(sfx, t0, creak(.7, 160, .6), .3, rs.rand() - .5)
for i, t0 in enumerate([39.8, 41.3, 42.8, 43.9, 45.0]):
    put(sfx, t0 - .2, rustle(.25, .5), .45, (i - 2) * .3)                         # бирка
    put(sfx, t0 - .05, thud(130, .15, .3, 1.0), .4, (i - 2) * .3)                  # шаг вперёд
put(sfx, 39.8, rustle(.4, .9), .5, -.6)                                            # мешок
put(sfx, 41.3, thud(220, .15, .5, 1.0), .5, -.3)                                   # книга
put(sfx, 42.8, metal(1250, 1.4, 1.0), .45, 0)                                      # шпага
put(sfx, 43.9, rustle(.35, 1.0), .5, .3)                                           # расписка
for k in range(4): put(sfx, 45.0 + k * .07, metal(600 + rs.rand() * 400, .5, .8), .35, .6)   # цепь
put(sfx, 47.7, whoosh(.8, .5, 300, 3000, True), .8, .3)
# 007 берег и карта
ambience(48.5, 50.6, 100, 1000, .1, .5, .3)
for k in range(8): put(sfx, 48.6 + k * .25, nz(.12, 400, 3000) * np.exp(-tt(int(.12 * SR)) * 30) * .4, .4, -.2)   # шаги по песку
put(sfx, 49.0, gull(), .4, .5)
put(sfx, 50.2, whoosh(.8, .45, 200, 3000, True), .8, 0)
r2 = np.random.RandomState(1607)
for i in range(26): put(sfx, 51.0 + i * .045 + r2.rand() * .2 + .3, blip(700 + r2.rand() * 500, .1, .5), .25, r2.rand() * .8 - .4)   # капли краски
put(sfx, 54.9, rustle(.5, .7), .6, 0)
for k in range(18): put(sfx, 55.2 + k * .078, nz(.06, 3000, 9000) * np.exp(-tt(int(.06 * SR)) * 40) * .5, .5, (k / 18 - .5) * .6)   # перо

# ---------------- реверберация и микс ----------------
def reverb(x, dur=1.8, wet=.22):
    n = int(dur * SR); ir = noise(n) * np.exp(-tt(n) * 6.9 / dur); ir = spectral_filter(ir, 120, 6000); ir /= np.sqrt((ir ** 2).sum())
    out = np.zeros_like(x)
    L = len(x) + n
    for c in range(2): out[:, c] = np.fft.irfft(np.fft.rfft(x[:, c], L) * np.fft.rfft(ir if c == 0 else np.roll(ir, 37), L), L)[:len(x)]
    return x * (1 - wet) + out * wet * 3
music = reverb(music, 2.2, .28); sfx = reverb(sfx, 1.2, .12)
def norm(x, peak): m = np.abs(x).max() + 1e-9; return x * (peak / m)
music = norm(music, .62); sfx = norm(sfx, .55)
# короткий хвост: плавное затухание к концу ролика
fade = np.ones(N); fl = int(1.2 * SR); fade[-fl:] = np.linspace(1, 0, fl) ** 1.5
mix = (music + sfx) * fade[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1)   # мягкий лимитер против клиппинга
mix = norm(mix, 0.89)                      # пик ≈ −1 дБFS
def write(path, x):
    x = np.clip(x, -1, 1); y = (x * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
os.makedirs('assets/audio', exist_ok=True)
write('assets/audio/music.wav', music * fade[:, None]); write('assets/audio/sfx.wav', sfx * fade[:, None]); write('assets/audio/mix.wav', mix)
ACC = [(3.6, 'разрыв открытки — обрыв музыки'), (7.17, 'медальон «XVII век» — pop'), (9.5, 'груз «земля» — литавра'), (11.5, 'груз «деньги» — литавра'),
       (14.5, 'шпиль «церковь» — литавра + колокол, максимальный крен'), (19.0, 'match cut по шпилю — вход хорала'), (22.15, 'двери распахнуты — удар'),
       (25.5, 'склейка в смазе — вход темы «надежды»'), (29.55, 'маркер Джеймстаун — колокольчик'), (29.8, 'маркер Плимут — колокольчик'), (31.5, 'нырок в море — всплеск'),
       (36.5, 'подъём на палубу — возврат темы'), (46.5, 'строй типажей — удар'), (52.0, 'волна заливки колоний — кульминация, ре мажор'), (56.8, 'финальное разрешение')]
with open('assets/audio/accents.yaml', 'w') as f:
    f.write('# Карта акцентов фактической дорожки: время → событие → кадр (frame = round(t*60))\n# Озвучки нет: при её появлении сверить на слух и пересчитать.\naccents:\n')
    for t0, e in ACC: f.write(f'  - {{ t: {t0:.2f}, frame: {round(t0 * 60)}, event: "{e}" }}\n')
print('ok', N / SR, 's', 'mix peak', np.abs(mix).max())
