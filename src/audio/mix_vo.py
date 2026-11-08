"""Пересведение с озвучкой, когда появится script/voiceover.wav:
music приглушается под речью (ducking −12 дБ, атака 0,15 с, отпуск 0,4 с), SFX −4 дБ под речью.
usage: python3 src/audio/mix_vo.py  →  assets/audio/mix_vo.wav
"""
import numpy as np, wave
SR = 48000
def read(p):
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(float) / 32768
    x = x.reshape(-1, w.getnchannels()); assert w.getframerate() == SR, 'нужно 48 кГц (ffmpeg -ar 48000)'
    return x if x.shape[1] == 2 else np.repeat(x, 2, 1)
music, sfx, vo = read('assets/audio/music.wav'), read('assets/audio/sfx.wav'), read('script/voiceover.wav')
n = max(len(music), len(vo)); pad = lambda x: np.vstack([x, np.zeros((n - len(x), 2))])
music, sfx, vo = pad(music), pad(sfx), pad(vo)
win = int(.05 * SR); e = np.sqrt(np.convolve((vo ** 2).mean(1), np.ones(win) / win, 'same'))
speech = (e > 10 ** (-40 / 20)).astype(float)
g = np.zeros(n); a, r = 1 / (.15 * SR), 1 / (.4 * SR); s = 0.0
for i in range(n): s += (speech[i] - s) * (a if speech[i] > s else r); g[i] = s
duck_m = 10 ** (-12 * g / 20); duck_s = 10 ** (-4 * g / 20)
mix = music * duck_m[:, None] + sfx * duck_s[:, None] + vo
mix *= .89 / (np.abs(mix).max() + 1e-9)
y = (np.clip(mix, -1, 1) * 32767).astype('<i2')
with wave.open('assets/audio/mix_vo.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
print('ok')
