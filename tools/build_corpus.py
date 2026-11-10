#!/usr/bin/env python3
"""Собирает поисковую базу docs/data/corpus.js из PDF-учебников (нужен PyMuPDF: pip install pymupdf).
Запуск из корня репозитория: python3 tools/build_corpus.py"""
import pymupdf, re, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOKS = [("schoolbock/Общество 9 класс.pdf", 9, 2, 211), ("schoolbock/Общество 10 класс.pdf", 10, 4, 223)]
CH = r"(Человек в мире культуры|Человек|Деятельность, общение, взаимодействие|Личность, общество, государство|Социальная сфера общества|Политическая сфера общества|Экономическая сфера общества|Духовная сфера общества)"
END = re.compile(r"[.!?…:;»)]$")

def blocks(path, off, last):
    doc = pymupdf.open(os.path.join(ROOT, path)); sec = 0
    for pi, page in enumerate(doc):
        pno = pi - off
        if pno < 6 or pno >= last: continue
        for b in page.get_text("dict")["blocks"]:
            lines, body, head = [], False, False
            for l in b.get("lines", []):
                lt = ""
                for s in l["spans"]:
                    fn, sz, tx = s["font"], round(s["size"]), s["text"]
                    if fn == "Arial": continue
                    if fn == "Pragmatica-Bold" and sz >= 17: head = True
                    if fn.startswith("SchoolBookC"): body = True
                    if fn == "SchoolBookC-Bold" and sz == 12 and tx.strip(): tx = "⟦" + tx + "⟧"
                    lt += tx
                lines.append(lt.replace("\xad", ""))
            t = ""
            for l in lines:
                if t.endswith("-") and l[:1].islower(): t = t[:-1] + l
                elif t.endswith("-⟧") and l.startswith("⟦"): t = t[:-2] + l[1:]
                else: t = (t + " " + l) if t else l
            t = re.sub(r"⟧(\s*)⟦", r"\1", t); t = re.sub(r"\s+", " ", t).strip()
            m = re.match(r"^§ ?(\d+)\. ", t)
            if head and m: sec = int(m.group(1)); continue
            if not body or not t or not sec: continue
            if re.search(r"⟦§ ?\d+⟧", t) or re.fullmatch(r"[\d\s?IVX⟦⟧]+", t): continue
            yield sec, pno, t

def clean(t):
    t = re.sub(r"(?:§ ?\d+ )?" + CH + r" (?:IV|III|II|I)(?= |$)", "", t)
    t = re.sub(r"^§ ?\d+ ", "", t)
    t = re.sub(r"([а-яё])- +([а-яё])", r"\1\2", t)
    t = t.replace("Ã", "").replace("Í", "")
    return re.sub(r"\s+", " ", t).strip()

out = []
for path, g, off, last in BOOKS:
    paras = []
    for sec, pno, t in blocks(path, off, last):
        if paras and paras[-1][0] == sec and not END.search(paras[-1][2].replace("⟧", "")) and pno - paras[-1][1] <= 2:
            p = paras[-1]
            p[2] = (p[2][:-1] + t) if (p[2].endswith("-") and t[:1].islower()) else (p[2] + " " + t)
        else: paras.append([sec, pno, t])
    merged = []
    for sec, pno, t in paras:
        t = clean(t)
        if len(t) < 25: continue
        if merged and merged[-1][1] == sec and len(merged[-1][3]) < 260 and len(merged[-1][3]) + len(t) < 900:
            merged[-1][3] += " " + t
        else: merged.append([g, sec, pno, t])
    out += merged
with open(os.path.join(ROOT, "docs/data/corpus.js"), "w", encoding="utf-8") as f:
    f.write("// Сгенерировано tools/build_corpus.py из учебных пособий «Обществоведение» 9 и 10 кл. (под ред. А. Н. Данилова)\n")
    f.write("// Формат: [класс, параграф, страница, текст]; ⟦…⟧ — выделенные в учебнике понятия\n")
    f.write("window.CORPUS=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
print(len(out), "абзацев", sum(len(x[3]) for x in out), "символов")
