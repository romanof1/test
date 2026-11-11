<?php
	#===========================>>>>>>>>>>>>>>
	#=====Настройки=============>>>>>>>>>>>>>>
	#===========================>>>>>>>>>>>>>>

	$TITLE = "Radio TRP2FM - Слушать онлайн. Заказ треков";
	$COPY = "&copy;TRP2FM, 2026";
	$ORDER_URL = "https://myradio24.com/ru/table/trp2fm";

	#Ссылки меню. Формат: 'ТЕКСТ::АДРЕС::BLANK'
	#Адрес, начинающийся с #, прокручивает к разделу на этой же странице (эфир не прерывается)
	$LINKS = array(
	  'ГЛАВНАЯ::#top',
	  'ЭФИР::#air',
	  'ПРИЛОЖЕНИЕ::#app',
	  'ВАКАНСИИ::#team',
	  'РЕКЛАМА::https://gta-trinity.com/forum/topic/252397-radio-trp2fm-%E2%80%94-%D1%80%D0%B5%D0%BA%D0%BB%D0%B0%D0%BC%D0%B0-%D0%BD%D0%B0-%D0%BD%D0%B0%D1%88%D0%B5%D0%BC-%D1%80%D0%B0%D0%B4%D0%B8%D0%BE/::BLANK',
	  'VK::https://vk.com/radiotrp2fm::BLANK',
	  'TELEGRAM::https://t.me/trp2fm::BLANK',
	  'TRINITY GTA::http://gta-trinity.com::BLANK'
	  );

	#Пути к картинкам разделов (лежат в старых папках /app и /rabota)
	$APP_SHOT_1   = "/app/IMG_2685.png";
	$APP_SHOT_2   = "/app/IMG_2687.png";
	$APP_STORE    = "/app/app_store.png";
	$GOOGLE_PLAY  = "/app/Google_play.png";

  $L_TEXTS = [];
  $L_ADDRESSES = [];
  $L_ISBLANK = [];
  for($i = 0; $i < count($LINKS); $i++){
    $l = explode("::", $LINKS[$i]);
    $L_TEXTS[$i] = $l[0];
    $L_ADDRESSES[$i] = $l[1];
    if(isset($l[2]) && $l[2] == "BLANK") $L_ISBLANK[$i] = true; else $L_ISBLANK[$i] = false;
  }

  #wtd = true — мобильное меню
  function printlink($wtd, $i){
    $addr = $GLOBALS['L_ADDRESSES'][$i];
    $s = $wtd ? "<a class=\"mobile-nav-link\" " : "<a class=\"nav-link\" ";
    if($GLOBALS['L_ISBLANK'][$i]) $s .= "target=\"_blank\" rel=\"noopener\" ";
    if(substr($addr, 0, 1) == "#") $s .= "data-spy=\"".substr($addr, 1)."\" ";
    $s .= "href=\"".$addr."\">".$GLOBALS['L_TEXTS'][$i]."</a>";
    echo $s;
  }
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#08030f">
    <meta name="description" content="Radio TRP2FM — радио сообщества Trinity GTA. Слушай онлайн 24/7, заказывай треки, скачай приложение и стань ведущим.">
    <!-- Yandex.Metrika counter -->
    <script type="text/javascript">
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    ym(61900488, "init", {clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
    </script>
    <noscript><div><img src="https://mc.yandex.ru/watch/61900488" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
    <!-- /Yandex.Metrika counter -->
    <link rel="icon" href="/imgs/favicon.jpg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;800&family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <title><?php echo $TITLE; ?></title>
    <script>
    /* Запоминаем аудио-элемент плеера, чтобы точно знать: играет эфир, грузится или стоит */
    window.__trpMedia = [];
    (function(){ try {
        var P = HTMLMediaElement.prototype, orig = P.play;
        P.play = function(){
            if (window.__trpMedia.indexOf(this) < 0) { window.__trpMedia.push(this); document.dispatchEvent(new CustomEvent('trp:media', { detail: this })); }
            return orig.apply(this, arguments);
        };
    } catch (e) {} })();
    document.documentElement.className += ' js';
    </script>
    <style>
        :root {
            /* цветовая гамма — прежняя */
            --ink:      #08030f;
            --ink-2:    #120822;
            --violet:   #8b5cf6;
            --violet-2: #b794ff;
            --neon:     #ff4fd8;
            --paper:    #efe7ff;
            --mute:     #9a90b5;
            --line:     rgba(183,148,255,0.16);
            --glass:    rgba(183,148,255,0.06);
            --glass-2:  rgba(18,8,34,0.72);
            --display:  'Unbounded', 'Arial Black', Impact, sans-serif;
            --body:     'Onest', system-ui, -apple-system, 'Segoe UI', sans-serif;
            --mono:     'JetBrains Mono', ui-monospace, Consolas, monospace;
            --ease:     cubic-bezier(.22,1,.36,1);
            --r:        24px;
            --pad-l:    max(16px, env(safe-area-inset-left, 0px));
            --pad-r:    max(16px, env(safe-area-inset-right, 0px));
            --dock-h:   72px;

            /* имена, которые использовал прежний блок плеера */
            --purple-glow:  #a855f7;
            --purple-light: #c084fc;
            --border:       rgba(168, 85, 247, 0.25);
            --white:        #ffffff;
        }

        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; overflow-x: hidden; }
        body {
            margin: 0; min-width: 320px; overflow-x: hidden;
            background: var(--ink); color: var(--paper);
            font: 400 16px/1.6 var(--body); text-align: left; -webkit-font-smoothing: antialiased;
        }
        a, a:hover { color: inherit; text-decoration: none; }
        h1, h2, h3, p, ol, ul { margin: 0; }
        button { font: inherit; color: inherit; }
        img, svg { display: block; }
        [hidden] { display: none !important; }
        :focus-visible { outline: 2px solid var(--violet-2); outline-offset: 3px; border-radius: 8px; }
        ::selection { background: var(--violet); color: #fff; }

        /* ─── ФОН ─── */
        .atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .atmo i { position: absolute; border-radius: 50%; filter: blur(90px); will-change: transform; }
        .atmo .a1 { width: 60vmax; height: 60vmax; left: -22vmax; top: -26vmax; background: rgba(110,60,220,.42); animation: float1 26s ease-in-out infinite alternate; }
        .atmo .a2 { width: 46vmax; height: 46vmax; right: -16vmax; top: 6vmax; background: rgba(139,92,246,.26); animation: float2 32s ease-in-out infinite alternate; }
        .atmo .a3 { width: 40vmax; height: 40vmax; left: 12vmax; bottom: -24vmax; background: rgba(255,79,216,.13); animation: float1 38s ease-in-out infinite alternate-reverse; }
        @keyframes float1 { to { transform: translate(6vmax, 5vmax) scale(1.1); } }
        @keyframes float2 { to { transform: translate(-7vmax, 6vmax) scale(.92); } }
        .grain { position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: .06;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

        .page-wrap { position: relative; z-index: 2; padding: 0 var(--pad-r) 0 var(--pad-l); overflow-x: clip; } /* clip: ничего не вылезает за экран по ширине, шапка при этом остаётся «липкой» */
        .wrap { max-width: 1200px; margin: 0 auto; }
        section[id] { scroll-margin-top: 96px; }

        /* стекло */
        .card { position: relative; border-radius: var(--r); border: 1px solid var(--line);
            background: linear-gradient(160deg, rgba(183,148,255,.09), rgba(183,148,255,.025) 55%);
            box-shadow: inset 0 1px 0 rgba(255,255,255,.07); }

        /* ─── ШАПКА ─── */
        .top { position: sticky; top: calc(10px + env(safe-area-inset-top, 0px)); z-index: 100; padding-top: 10px; }
        .navrow { display: flex; align-items: center; gap: 8px; height: 60px; padding: 0 10px 0 20px; border-radius: 18px;
            border: 1px solid var(--line); background: rgba(12,5,24,.72);
            -webkit-backdrop-filter: blur(18px) saturate(1.4); backdrop-filter: blur(18px) saturate(1.4);
            box-shadow: 0 14px 40px -18px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.06); }
        .logo { display: flex; align-items: center; gap: 10px; font: 800 18px var(--display); letter-spacing: -.3px; color: var(--paper); margin-right: auto; }
        .logo em { font-style: normal; color: var(--violet-2); }
        .logo i { width: 8px; height: 8px; border-radius: 50%; background: var(--neon); box-shadow: 0 0 0 4px rgba(255,79,216,.18), 0 0 14px var(--neon); animation: pulse 1.6s ease-in-out infinite; }
        @keyframes pulse { 50% { opacity: .35; } }
        .links { display: flex; align-items: center; }
        .links .nav-link { font: 600 12px var(--body); text-transform: uppercase; letter-spacing: 1.1px; color: var(--mute);
            padding: 9px 11px; border-radius: 10px; transition: color .2s, background .2s; white-space: nowrap; }
        .links .nav-link:hover { color: var(--paper); background: rgba(183,148,255,.1); }
        .links .nav-link.cur { color: var(--paper); background: rgba(139,92,246,.2); }
        .nav-order { margin-left: 8px; font: 700 13px var(--body); padding: 10px 16px; border-radius: 12px; background: var(--violet); color: #fff; white-space: nowrap;
            transition: background .2s, transform .2s var(--ease); }
        .nav-order:hover { background: #9b6dff; color: #fff; transform: translateY(-1px); }
        .burger { display: none; align-items: center; gap: 8px; background: rgba(183,148,255,.08); border: 1px solid var(--line); color: var(--paper);
            font: 600 13px var(--body); padding: 0 14px; height: 40px; border-radius: 12px; cursor: pointer; }
        .burger span, .burger span::before, .burger span::after { display: block; width: 16px; height: 2px; border-radius: 2px; background: currentColor; position: relative; transition: transform .25s var(--ease), background .2s; }
        .burger span::before, .burger span::after { content: ""; position: absolute; left: 0; }
        .burger span::before { top: -5px; } .burger span::after { top: 5px; }
        .burger[aria-expanded="true"] span { background: transparent; }
        .burger[aria-expanded="true"] span::before { transform: translateY(5px) rotate(45deg); }
        .burger[aria-expanded="true"] span::after { transform: translateY(-5px) rotate(-45deg); }
        .drawer { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px; padding: 10px; border-radius: 18px; border: 1px solid var(--line);
            background: rgba(12,5,24,.94); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); box-shadow: 0 24px 60px -20px rgba(0,0,0,.9); }
        .drawer .mobile-nav-link { font: 600 13px var(--body); letter-spacing: 1px; text-transform: uppercase; color: var(--paper); padding: 14px; border-radius: 12px; background: rgba(183,148,255,.06); }
        .drawer .mobile-nav-link:hover, .drawer .mobile-nav-link:active { background: rgba(139,92,246,.25); color: #fff; }

        /* ─── КНОПКИ ─── */
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 54px; padding: 0 26px; border-radius: 16px; border: 1px solid transparent;
            font: 700 15px/1.2 var(--body); cursor: pointer; transition: transform .25s var(--ease), box-shadow .25s, background .25s, border-color .25s; -webkit-tap-highlight-color: transparent; }
        .btn svg { width: 20px; height: 20px; flex-shrink: 0; }
        .btn:active { transform: scale(.97); }
        .btn-main, .btn-main:hover { color: #fff; background: linear-gradient(135deg, var(--violet) 20%, #b05cf0 60%, var(--neon) 130%);
            box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 16px 40px -14px var(--violet); }
        .btn-main:hover { transform: translateY(-2px); box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 22px 50px -14px var(--violet); }
        .btn-ghost { border-color: var(--line); background: var(--glass); color: var(--paper); }
        .btn-ghost:hover { border-color: var(--violet-2); background: rgba(139,92,246,.14); color: var(--paper); transform: translateY(-2px); }
        .btn .i-pause, .on .btn .i-play { display: none; }
        .on .btn .i-pause { display: block; }
        .btn .t-on, .on .btn .t-off { display: none; }
        .on .btn .t-on { display: inline; }

        /* эквалайзер */
        .eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 14px; flex-shrink: 0; }
        .eq i { width: 3px; height: 100%; border-radius: 2px; background: currentColor; transform-origin: 50% 100%; transform: scaleY(.25); }
        .on .eq i { animation: eq 1s ease-in-out infinite; }
        .eq i:nth-child(2) { animation-delay: -.35s; } .eq i:nth-child(3) { animation-delay: -.7s; } .eq i:nth-child(4) { animation-delay: -.2s; }
        @keyframes eq { 0%,100% { transform: scaleY(.25); } 30% { transform: scaleY(1); } 60% { transform: scaleY(.5); } }

        /* ─── HERO ─── */
        .hero { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr); gap: clamp(28px, 5vw, 72px); align-items: center; padding: clamp(36px, 6vw, 84px) 0 clamp(40px, 6vw, 72px); }
        .hero-copy { min-width: 0; }
        .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
        .chip { display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--glass);
            font: 600 11px var(--mono); letter-spacing: 1.4px; text-transform: uppercase; color: var(--mute); }
        .chip.live { color: var(--neon); border-color: rgba(255,79,216,.45); background: rgba(255,79,216,.08); box-shadow: 0 0 24px -6px rgba(255,79,216,.6); }
        .chip.live i { width: 8px; height: 8px; border-radius: 50%; background: var(--neon); box-shadow: 0 0 10px var(--neon); animation: pulse 1.4s ease-in-out infinite; }
        .chip b { color: var(--paper); font-weight: 600; }
        .chip svg { width: 14px; height: 14px; }
        .word { font: 800 clamp(58px, 9.4vw, 116px)/.9 var(--display); letter-spacing: -.045em; margin: 0 0 22px -.04em; white-space: nowrap; }
        .word em { font-style: normal; color: transparent; background: linear-gradient(100deg, var(--violet-2), var(--violet) 35%, var(--neon) 70%, var(--violet-2)); background-size: 220% 100%;
            -webkit-background-clip: text; background-clip: text; animation: sheen 8s linear infinite; }
        @keyframes sheen { to { background-position: -220% 0; } }
        .tag { font-size: clamp(16px, 1.5vw, 19px); color: var(--mute); max-width: 44ch; margin-bottom: 32px; line-height: 1.6; }
        .tag b { color: var(--paper); font-weight: 600; }
        .cta { display: flex; gap: 12px; flex-wrap: wrap; }
        .facts { display: flex; flex-wrap: wrap; gap: 10px 28px; margin-top: 34px; padding-top: 22px; border-top: 1px solid var(--line); font: 500 12px var(--mono); letter-spacing: 1px; text-transform: uppercase; color: var(--mute); }
        .facts b { color: var(--violet-2); font-weight: 600; }

        /* карточка «сейчас играет» */
        .np { padding: clamp(16px, 2vw, 24px); justify-self: center; width: 100%; max-width: 480px; }
        .np-glow { position: absolute; inset: 8% 8% 22%; border-radius: 50%; background: var(--violet) center / cover no-repeat; filter: blur(70px) saturate(1.7); opacity: .5; z-index: -1; transition: opacity .6s; }
        .on .np-glow { opacity: .8; }
        .np-art { position: relative; aspect-ratio: 1 / 1; }
        .vinyl { position: absolute; inset: 6%; border-radius: 50%; background: repeating-radial-gradient(circle, #0d0a12 0 1.5px, #1b1524 1.5px 3px);
            box-shadow: 0 0 0 1px rgba(183,148,255,.14), 0 20px 50px rgba(0,0,0,.6); transition: transform .9s var(--ease); }
        .vinyl::before { content: ""; position: absolute; inset: 0; border-radius: 50%; animation: spin 3.4s linear infinite; animation-play-state: paused;
            background: conic-gradient(from 30deg, transparent 0 8%, rgba(255,255,255,.1) 12%, transparent 18% 50%, rgba(255,255,255,.08) 62%, transparent 68%); }
        .vinyl::after { content: ""; position: absolute; inset: 36%; border-radius: 50%; background: linear-gradient(135deg, var(--violet), var(--neon)); box-shadow: 0 0 0 3px #0d0a12; }
        .on .vinyl { transform: translateX(18%); }
        .on .vinyl::before { animation-play-state: running; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cover { position: absolute; inset: 0 12% 0 0; margin: auto 0; aspect-ratio: 1 / 1; height: 88%; border-radius: 20px; overflow: hidden; background: linear-gradient(135deg, #2a1452, #501a6e);
            box-shadow: 0 30px 70px -20px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.1); transition: transform .9s var(--ease); display: grid; place-items: center; }
        .cover::before { content: "TRP2FM"; font: 800 clamp(18px, 2.4vw, 28px) var(--display); color: rgba(239,231,255,.35); letter-spacing: -.5px; }
        .on .cover { transform: translateX(-2%) rotate(-2deg); }
        .cover [data-myinfo="img"] { position: absolute !important; inset: 0 !important; width: auto !important; height: auto !important; margin: 0 !important; display: block !important;
            border-radius: 0 !important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important; }
        [data-myinfo="logo"] { display: none !important; }
        .np-play { position: absolute; right: 6%; bottom: 4%; width: 68px; height: 68px; border-radius: 50%; border: 0; cursor: pointer; color: #fff; display: grid; place-items: center;
            background: linear-gradient(135deg, var(--violet), var(--neon) 140%); box-shadow: 0 0 0 6px rgba(8,3,15,.55), 0 14px 34px -8px var(--violet); transition: transform .25s var(--ease); z-index: 2; }
        .np-play:hover { transform: scale(1.07); } .np-play:active { transform: scale(.95); }
        .np-play svg { width: 28px; height: 28px; }
        .np-play .i-pause, .on .np-play .i-play { display: none; }
        .on .np-play .i-pause { display: block; }
        .np-body { padding: 20px 4px 4px; min-width: 0; }
        .np-k { display: flex; align-items: center; gap: 10px; font: 600 11px var(--mono); letter-spacing: 1.6px; text-transform: uppercase; color: var(--mute); }
        .np-k .eq { color: var(--neon); }
        .np-k [data-myinfo="djname"] { color: var(--violet-2); }
        .np-t { overflow: hidden; margin-top: 10px; }
        .np-t.scroll { -webkit-mask-image: linear-gradient(90deg, #000 86%, transparent); mask-image: linear-gradient(90deg, #000 86%, transparent); }
        .now-track { display: inline-block; white-space: nowrap; font: 700 clamp(20px, 2.1vw, 26px)/1.25 var(--body); letter-spacing: -.3px; }
        .np-t.scroll .now-track { animation: tick var(--dur, 12s) ease-in-out infinite alternate; }
        @keyframes tick { 0%,15% { transform: translateX(0); } 85%,100% { transform: translateX(calc(-1 * var(--dist, 0px))); } }
        .np-a { color: var(--mute); font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-height: 24px; }

        /* ─── БЕГУЩАЯ ЛЕНТА ─── */
        .band { margin: 0 calc(-1 * var(--pad-r)) 0 calc(-1 * var(--pad-l)); overflow: hidden; padding: 16px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
            background: linear-gradient(90deg, rgba(139,92,246,.14), rgba(255,79,216,.08), rgba(139,92,246,.14)); }
        .band-in { display: flex; width: max-content; animation: run 44s linear infinite; }
        .band-in span { font: 700 clamp(15px, 1.6vw, 19px) var(--display); text-transform: uppercase; letter-spacing: .5px; white-space: nowrap; padding-right: 26px; color: var(--paper); }
        .band-in span:nth-child(even) { color: transparent; -webkit-text-stroke: 1px var(--violet-2); }
        .band-in span i { font-style: normal; color: var(--neon); padding-left: 26px; -webkit-text-stroke: 0; }
        @keyframes run { to { transform: translateX(-50%); } }

        /* ─── РАЗДЕЛЫ ─── */
        .sec { padding: clamp(56px, 8vw, 104px) 0 0; }
        .kicker { display: inline-flex; align-items: center; gap: 10px; font: 600 11px var(--mono); letter-spacing: 2px; text-transform: uppercase; color: var(--neon); margin-bottom: 16px; }
        .kicker::before { content: ""; width: 22px; height: 1px; background: var(--neon); }
        .big { margin: 0 0 18px; font: 800 clamp(30px, 4.6vw, 60px)/1.02 var(--display); letter-spacing: -.035em; text-wrap: balance; }
        .big em { font-style: normal; color: transparent; background: linear-gradient(100deg, var(--violet-2), var(--neon)); -webkit-background-clip: text; background-clip: text; }
        .lede { font-size: 17px; color: var(--mute); line-height: 1.7; max-width: 52ch; margin: 0 0 28px; }
        .lede b { color: var(--paper); font-weight: 600; }
        .h2row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
        .h2row h2 { font: 700 clamp(20px, 2.2vw, 26px)/1.1 var(--display); letter-spacing: -.02em; }
        .h2row small { font: 500 11px var(--mono); color: var(--mute); letter-spacing: 1.5px; text-transform: uppercase; white-space: nowrap; }

        /* ─── ЭФИР: журнал + соцсети ─── */
        .lower { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 20px; align-items: start; }
        .pane { padding: clamp(18px, 2.4vw, 28px); }
        .scroll-log { max-height: 492px; overflow-y: auto; margin: 0 -8px; padding: 0 8px; scrollbar-width: thin; scrollbar-color: rgba(139,92,246,.5) transparent; overscroll-behavior: contain; }
        .scroll-log::-webkit-scrollbar { width: 4px; }
        .scroll-log::-webkit-scrollbar-thumb { background: rgba(139,92,246,.5); border-radius: 4px; }
        .my_lastsongs { display: block; width: 100%; }
        .my_lastsonghtml { display: none; }
        .log-empty { color: var(--mute); font-size: 14px; padding: 18px 4px; }
        a.logrow { display: grid !important; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 10px; border-radius: 14px;
            color: var(--paper) !important; transition: background .2s; }
        a.logrow + a.logrow { margin-top: 2px; }
        a.logrow:hover, a.logrow:focus-visible { background: rgba(139,92,246,.14); }
        a.logrow img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; background: linear-gradient(135deg, #2a1452, #501a6e); box-shadow: 0 0 0 1px rgba(255,255,255,.08); }
        a.logrow .nm { font-weight: 600; font-size: 15px; line-height: 1.3; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        a.logrow .nm small { display: block; font: 400 13px var(--body); color: var(--mute); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; }
        a.logrow time { font: 500 12px var(--mono); color: var(--mute); font-variant-numeric: tabular-nums; }
        a.logrow.live { background: linear-gradient(90deg, rgba(255,79,216,.14), rgba(139,92,246,.1)); box-shadow: inset 0 0 0 1px rgba(255,79,216,.28); }
        a.logrow.live time { color: var(--neon); }
        a.logrow.live .nm small { color: var(--violet-2); }

        .side { display: grid; gap: 20px; }
        .about { font-size: 15px; color: var(--mute); line-height: 1.65; margin: 0 0 18px; }
        .about b { color: var(--paper); font-weight: 600; }
        .freqs { display: grid; gap: 8px; }
        .freqs a { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 16px; border: 1px solid var(--line); background: rgba(8,3,15,.35);
            transition: transform .25s var(--ease), border-color .25s, background .25s; }
        .freqs a:hover, .freqs a:focus-visible { transform: translateX(4px); border-color: var(--violet-2); background: rgba(139,92,246,.16); }
        .freqs .ico { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; overflow: hidden; flex-shrink: 0; font: 800 12px var(--display); color: #fff; }
        .freqs .ico img { width: 100%; height: 100%; object-fit: contain; }
        .freqs .ico b { display: none; }
        .freqs .ico.noimg { background: var(--c); }
        .freqs .ico.noimg b { display: block; }
        .freqs .t { font-weight: 700; font-size: 16px; line-height: 1.25; min-width: 0; }
        .freqs .t small { display: block; font: 400 12px var(--mono); color: var(--mute); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .freqs .ar { margin-left: auto; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: rgba(183,148,255,.1); flex-shrink: 0; transition: background .25s, transform .25s var(--ease); }
        .freqs .ar svg { width: 16px; height: 16px; }
        .freqs a:hover .ar { background: var(--violet); transform: rotate(-45deg); }
        .order { overflow: hidden; background: linear-gradient(135deg, rgba(139,92,246,.5), rgba(255,79,216,.22)); }
        .order h3 { font: 700 20px/1.2 var(--display); letter-spacing: -.02em; margin-bottom: 8px; }
        .order p { color: rgba(239,231,255,.8); font-size: 15px; margin-bottom: 18px; max-width: 34ch; }
        .order .btn { background: #fff; color: #2a0f5c; min-height: 48px; }
        .order .btn:hover { transform: translateY(-2px); color: #2a0f5c; }
        .order::after { content: "♪"; position: absolute; right: 8px; bottom: -42px; font: 800 170px/1 var(--display); color: rgba(255,255,255,.09); transform: rotate(-12deg); pointer-events: none; }

        /* ─── ПРИЛОЖЕНИЕ ─── */
        .app { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: clamp(24px, 4vw, 56px); align-items: center; padding: clamp(22px, 4vw, 56px); overflow: hidden; }
        .steps { list-style: none; padding: 0; counter-reset: s; margin-bottom: 28px; display: grid; gap: 4px; }
        .steps li { counter-increment: s; display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 16px; padding: 12px 0; align-items: start; }
        .steps li::before { content: counter(s); width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; font: 700 15px var(--display); color: var(--violet-2);
            background: rgba(139,92,246,.14); border: 1px solid var(--line); }
        .steps b { display: block; font-size: 16px; font-weight: 600; margin-bottom: 2px; }
        .steps span { color: var(--mute); font-size: 14.5px; line-height: 1.55; display: block; }
        .steps span b { display: inline; color: var(--paper); font-size: inherit; }
        .steps span a { color: var(--violet-2); text-decoration: underline; text-decoration-color: rgba(183,148,255,.4); text-underline-offset: 3px; }
        .stores { display: flex; gap: 10px; flex-wrap: wrap; }
        .store { display: inline-flex; align-items: center; gap: 12px; min-height: 58px; padding: 8px 20px 8px 16px; border-radius: 16px; border: 1px solid var(--line); background: rgba(8,3,15,.5);
            transition: transform .25s var(--ease), border-color .25s, background .25s; }
        .store:hover { border-color: var(--violet-2); background: rgba(139,92,246,.16); transform: translateY(-2px); }
        .store img, .store svg { width: 28px; height: 28px; object-fit: contain; flex-shrink: 0; }
        .store img + svg { display: none; }
        .store small { display: block; font: 500 10px var(--mono); color: var(--mute); letter-spacing: 1px; text-transform: uppercase; line-height: 1.3; }
        .store b { font-weight: 700; font-size: 16px; line-height: 1.2; }
        .phones { position: relative; height: 540px; max-width: 100%; }
        .phones::before { content: ""; position: absolute; inset: 12% 10%; border-radius: 50%; background: radial-gradient(circle, rgba(139,92,246,.55), transparent 65%); filter: blur(30px); }
        .phone { position: absolute; width: 240px; aspect-ratio: 9 / 19.5; border-radius: 40px; padding: 9px; background: linear-gradient(160deg, #3a2a57, #0d0816);
            box-shadow: 0 0 0 1px rgba(183,148,255,.3), 0 40px 90px -24px rgba(0,0,0,.9); transition: transform .6s var(--ease); }
        .phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 32px; background: #150a29; }
        .phone.noimg { display: grid; }
        .phone.noimg::before { content: "TRP2FM"; border-radius: 32px; display: grid; place-items: center; font: 800 20px var(--display); color: rgba(239,231,255,.5);
            background: radial-gradient(120% 60% at 50% 0%, rgba(255,79,216,.35), transparent 60%), linear-gradient(180deg, #2a1452, #0e0619); }
        .phone.p1 { left: 8%; top: 34px; transform: rotate(-7deg); z-index: 2; }
        .phone.p2 { right: 6%; top: 0; transform: rotate(6deg); }
        .app:hover .phone.p1 { transform: rotate(-4deg) translateY(-8px); }
        .app:hover .phone.p2 { transform: rotate(9deg) translateY(-4px); }

        /* ─── КОМАНДА ─── */
        .team { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: 20px; align-items: stretch; }
        .team > .card { padding: clamp(22px, 3.4vw, 44px); }
        .reqs { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 20px; }
        .req { display: inline-flex; align-items: center; gap: 8px; font: 600 13px var(--body); padding: 9px 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--glass); }
        .req::before { content: ""; width: 14px; height: 14px; border-radius: 50%; background: var(--violet) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14'%3E%3Cpath d='M4 7.2l2 2 4-4.4' fill='none' stroke='%23fff' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain; }
        .warn { display: flex; gap: 12px; align-items: center; border: 1px solid rgba(255,79,216,.4); color: var(--neon); background: rgba(255,79,216,.07); border-radius: 14px;
            padding: 12px 16px; font-weight: 600; font-size: 14px; margin-bottom: 26px; }
        .warn svg { width: 20px; height: 20px; flex-shrink: 0; }
        .steps-h { font: 600 11px var(--mono); letter-spacing: 2px; text-transform: uppercase; color: var(--mute); padding-bottom: 12px; }
        .contact { font-size: 14px; color: var(--mute); margin-top: 20px; }
        .contact a { color: var(--violet-2); text-decoration: underline; text-decoration-color: rgba(183,148,255,.4); text-underline-offset: 3px; }

        .site-footer { margin-top: clamp(56px, 8vw, 96px); padding: 26px 0 calc(var(--dock-h) + 44px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--line);
            display: flex; justify-content: space-between; gap: 12px 24px; flex-wrap: wrap; font: 500 12px var(--mono); color: var(--mute); letter-spacing: 1px; }

        /* появление блоков при прокрутке */
        .js .rv { opacity: 0; transform: translateY(26px); transition: opacity .7s var(--ease), transform .7s var(--ease); transition-delay: var(--d, 0s); }
        .js .rv.in { opacity: 1; transform: none; }

        /* ─── АНКЕТА (выезжающая панель) ─── */
        .scrim { position: fixed; inset: 0; z-index: 300; background: rgba(5,2,10,.66); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); opacity: 0; pointer-events: none; transition: opacity .3s; }
        .scrim.open { opacity: 1; pointer-events: auto; }
        .sheet { position: fixed; top: 10px; right: 10px; bottom: 10px; z-index: 310; width: min(480px, calc(100% - 20px)); display: flex; flex-direction: column; border-radius: 26px;
            padding: calc(22px + env(safe-area-inset-top, 0px)) 22px calc(22px + env(safe-area-inset-bottom, 0px));
            background: var(--ink-2); border: 1px solid var(--line); transform: translateX(calc(100% + 20px)); visibility: hidden;
            transition: transform .5s var(--ease), visibility 0s linear .5s; }
        .sheet.open { transform: none; visibility: visible; transition: transform .5s var(--ease); box-shadow: -40px 0 120px rgba(0,0,0,.7); }
        .sheet-h { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .sheet-h h3 { font: 700 22px var(--display); letter-spacing: -.02em; }
        .x { width: 42px; height: 42px; border-radius: 14px; border: 1px solid var(--line); background: var(--glass); color: var(--paper); font-size: 22px; line-height: 1; cursor: pointer; flex-shrink: 0; }
        .x:hover { border-color: var(--violet-2); }
        .live-line { display: flex; align-items: center; gap: 10px; font: 500 11px var(--mono); color: var(--mute); padding: 10px 14px; border: 1px solid var(--line); border-radius: 12px; margin: 16px 0 18px; min-width: 0; }
        .live-line i { width: 8px; height: 8px; border-radius: 50%; background: var(--mute); flex-shrink: 0; }
        .on .live-line i { background: var(--neon); box-shadow: 0 0 8px var(--neon); animation: pulse 1.2s infinite; }
        .live-line span { white-space: nowrap; }
        .live-line b { color: var(--paper); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
        .form { overflow-y: auto; display: grid; gap: 12px; padding-right: 4px; scrollbar-width: thin; scrollbar-color: rgba(139,92,246,.5) transparent; }
        .form label { display: grid; gap: 6px; margin: 0; font: 600 11px var(--mono); letter-spacing: 1px; text-transform: uppercase; color: var(--mute); }
        .form input { width: 100%; font: 500 16px var(--body); color: var(--paper); background: rgba(255,255,255,.04); border: 1px solid var(--line); border-radius: 12px;
            padding: 13px 14px; outline: none; transition: border-color .2s, background .2s; letter-spacing: 0; text-transform: none; }
        .form input::placeholder { color: rgba(154,144,181,.6); }
        .form input:focus { border-color: var(--violet-2); background: rgba(139,92,246,.08); }
        .form .btn { margin-top: 6px; }
        .done { text-align: center; padding: 48px 8px; }
        .done .t { font: 700 24px var(--display); letter-spacing: -.02em; margin-bottom: 10px; }
        .done p { color: var(--mute); margin: 0 0 24px; }

        /* ─── ВИЗУАЛИЗАТОРЫ ПЛЕЕРА (как раньше) ─── */
        #visualizer1, #visualizer2 { position: fixed; bottom: 30px; filter: blur(30px); opacity: 0.35; pointer-events: none; z-index: 3; }
        #visualizer1 { left: 0; }
        #visualizer2 { right: 0; }
        @media (max-width: 770px) { #visualizer1, #visualizer2 { display: none; } }

        /* ─── ПЛЕЕР: плавающая панель ─────────────────────────────────────────
           Все элементы стоят в одну строку через flex, без absolute-сдвигов,
           поэтому на телефоне ничего не наезжает друг на друга. */
        .player { position: fixed; z-index: 50; left: 50%; transform: translateX(-50%);
            bottom: calc(12px + env(safe-area-inset-bottom, 0px));
            width: min(920px, calc(100% - var(--pad-l) - var(--pad-r)));
            height: var(--dock-h); display: flex; align-items: center; gap: 14px; padding: 0 14px 0 12px; border-radius: 22px;
            border: 1px solid var(--border); background: rgba(14,6,28,.82);
            -webkit-backdrop-filter: blur(22px) saturate(1.5); backdrop-filter: blur(22px) saturate(1.5);
            box-shadow: 0 24px 60px -18px rgba(0,0,0,.9), 0 0 50px -22px var(--violet), inset 0 1px 0 rgba(255,255,255,.08); }
        .player::before { content: ""; position: absolute; left: 22px; right: 22px; top: -1px; height: 1px; pointer-events: none;
            background: linear-gradient(90deg, transparent, var(--violet), var(--neon), var(--violet), transparent); opacity: .8; }
        .deck-now { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1 1 auto; }
        .deck-now .mini { width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0; background: linear-gradient(135deg, #2a1452, #501a6e) center / cover no-repeat; box-shadow: 0 0 0 1px rgba(255,255,255,.1); }
        .deck-now .tx { min-width: 0; }
        .deck-now .k { display: flex; align-items: center; gap: 8px; font: 600 10px var(--mono); color: var(--neon); letter-spacing: 1.6px; text-transform: uppercase; }
        .deck-now .k .t-on, .on .deck-now .k .t-off { display: none; }
        .on .deck-now .k .t-on { display: inline; }
        .off .deck-now .k { color: var(--mute); }
        .deck-now .n { font-weight: 600; font-size: 15px; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--paper); }
        .deck-now .a { font-size: 12.5px; line-height: 1.3; color: var(--mute); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        #small-player { flex: 0 0 auto; display: flex; align-items: center; }
        .my_player { display: flex !important; align-items: center; gap: 16px; position: static !important; width: auto !important; height: auto !important; }

        /* кнопка play: сверху лежит прозрачная «родная» кнопка плеера .my_play, под ней — наша иконка */
        .pl-play { position: relative; width: 52px; height: 52px; flex: 0 0 52px; border-radius: 50%; color: #fff; display: grid; place-items: center; order: 2;
            background: linear-gradient(135deg, var(--violet), var(--neon) 150%); box-shadow: 0 8px 24px -6px var(--violet), inset 0 1px 0 rgba(255,255,255,.3); transition: transform .2s var(--ease); }
        .pl-play:hover { transform: scale(1.06); } .pl-play:active { transform: scale(.94); }
        .pl-play svg { width: 24px; height: 24px; grid-area: 1 / 1; }
        .pl-play .i-pause, .on .pl-play .i-play { display: none; }
        .on .pl-play .i-pause { display: block; }
        .pl-play .i-spin { grid-area: 1 / 1; width: 100%; height: 100%; border-radius: 50%; border: 2px solid transparent; border-top-color: #fff; opacity: 0; }
        .buf .pl-play .i-spin { opacity: 1; animation: spin .8s linear infinite; }
        .my_play { position: absolute !important; inset: 0 !important; left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; margin: 0 !important;
            transform: none !important; border-radius: 50%; opacity: 0 !important; cursor: pointer; background-size: cover; -webkit-tap-highlight-color: transparent; }
        .my_play:focus-visible { opacity: 1 !important; background: none !important; outline: 2px solid #fff; outline-offset: 3px; }

        .my_timer { position: static !important; order: 1; width: auto !important; min-width: 52px; text-align: right; font: 500 14px var(--mono) !important; font-variant-numeric: tabular-nums;
            color: var(--mute) !important; text-shadow: none; letter-spacing: .5px; }
        .on .my_timer { color: var(--violet-2) !important; }

        .show-volume { order: 3; display: flex; align-items: center; gap: 10px; margin: 0 !important; }
        .show-volume .vol-ico { width: 20px; height: 20px; color: var(--mute); flex-shrink: 0; }
        .my_volumediv { position: relative !important; right: auto !important; left: auto !important; top: auto !important; bottom: auto !important; width: 112px; height: 6px; border-radius: 6px;
            background: rgba(168,85,247,.22) !important; cursor: pointer; user-select: none; -webkit-user-select: none; touch-action: none; }
        .my_volumediv::before { content: ""; position: absolute; left: -8px; right: -8px; top: -14px; bottom: -14px; } /* увеличенная зона нажатия */
        .my_volume { height: 6px; max-width: 100%; border-radius: 6px; background: linear-gradient(90deg, var(--violet), var(--purple-light)) !important; pointer-events: none; }
        .my_volumecursor { position: absolute !important; top: -5px !important; width: 16px !important; height: 16px !important; margin-left: -6px; border-radius: 50% !important;
            background: #fff !important; box-shadow: 0 2px 8px rgba(0,0,0,.5), 0 0 0 4px rgba(168,85,247,.25); cursor: pointer; }
        .vol-btn { display: none; width: 44px; height: 44px; flex: 0 0 44px; border-radius: 14px; border: 1px solid var(--line); background: var(--glass); color: var(--paper); cursor: pointer; place-items: center; padding: 0; }
        .vol-btn svg { width: 20px; height: 20px; }
        .player.vol-open .vol-btn { border-color: var(--violet-2); background: rgba(139,92,246,.2); }

        /* ─── АДАПТИВ ─── */
        @media (max-width: 1100px) { .links, .nav-order { display: none; } .burger { display: inline-flex; } }
        @media (min-width: 1101px) { .drawer { display: none !important; } }
        @media (max-width: 900px) {
            .hero { grid-template-columns: 1fr; }
            .np { order: -1; max-width: 420px; }
            .word { font-size: clamp(54px, 17.6vw, 132px); }
            .lower, .team { grid-template-columns: 1fr; }
            .app { grid-template-columns: 1fr; }
            .phones { height: 440px; max-width: 440px; width: 100%; justify-self: center; order: -1; }
            .phone { width: 200px; }
        }
        @media (max-width: 640px) {
            :root { --dock-h: 66px; --r: 20px; }
            .btn { min-height: 52px; padding: 0 20px; }
            .cta .btn-main { flex: 1 1 100%; }
            .cta .btn-ghost { flex: 1 1 0; padding: 0 12px; }
            .drawer { grid-template-columns: 1fr 1fr; }
            a.logrow { grid-template-columns: 44px minmax(0, 1fr) auto; gap: 12px; padding: 8px; }
            a.logrow img { width: 44px; height: 44px; }
            .phones { height: 380px; }
            .phone { width: 172px; border-radius: 32px; padding: 7px; }
            .phone img, .phone.noimg::before { border-radius: 25px; }
            .sheet { top: auto; left: 0; right: 0; bottom: 0; width: 100%; max-height: 92dvh; border-radius: 26px 26px 0 0; transform: translateY(105%); }

            /* плеер на телефоне: обложка + название · громкость · play */
            .player { gap: 8px; padding: 0 8px; border-radius: 20px; }
            .deck-now .mini { width: 44px; height: 44px; border-radius: 12px; }
            .my_timer { display: none !important; }
            .pl-play { width: 50px; height: 50px; flex-basis: 50px; }
            .vol-btn { display: grid; }
            /* громкость открывается всплывающей панелью над плеером */
            .show-volume { position: absolute; right: 0; bottom: calc(100% + 10px); height: 56px; padding: 0 22px 0 16px; gap: 14px; border-radius: 18px; border: 1px solid var(--border);
                background: rgba(14,6,28,.96); box-shadow: 0 20px 50px -14px rgba(0,0,0,.9);
                opacity: 0; visibility: hidden; transform: translateY(8px); transition: opacity .2s, transform .25s var(--ease), visibility 0s linear .25s; }
            .player.vol-open .show-volume { opacity: 1; visibility: visible; transform: none; transition: opacity .2s, transform .25s var(--ease); }
            .my_volumediv { width: 180px; height: 8px; }
            .my_volume { height: 8px; }
            .my_volumecursor { top: -6px !important; width: 20px !important; height: 20px !important; margin-left: -8px; }
        }
        @media (prefers-reduced-motion: reduce) {
            html { scroll-behavior: auto; }
            *, *::before, *::after { animation: none !important; }
            .js .rv { opacity: 1; transform: none; transition: none; }
        }
    </style>
</head>
<body class="off">

<div class="atmo" aria-hidden="true"><i class="a1"></i><i class="a2"></i><i class="a3"></i></div>
<div class="grain" aria-hidden="true"></div>

<div class="page-wrap">

    <!-- ШАПКА -->
    <header class="top">
        <div class="wrap">
            <nav class="navrow" aria-label="Основное меню">
                <a class="logo" href="#top"><i></i><span>TRP<em>2</em>FM</span></a>
                <div class="links" id="pcm">
                    <?php for($i = 0; $i < count($LINKS); $i++) printlink(false, $i); ?>
                </div>
                <a class="nav-order" href="<?php echo $ORDER_URL; ?>" target="_blank" rel="noopener">Заказать трек</a>
                <button class="burger" id="mm" type="button" aria-expanded="false" aria-controls="mobile-nav"><span></span>Меню</button>
            </nav>
            <div class="drawer" id="mobile-nav" hidden>
                <?php for($i = 0; $i < count($LINKS); $i++) printlink(true, $i); ?>
            </div>
        </div>
    </header>

    <main class="wrap" role="main">

        <!-- ЭФИР -->
        <section class="hero" id="top">
            <div class="hero-copy">
                <div class="chips">
                    <span class="chip live"><i></i>В эфире 24/7</span>
                    <span class="chip" id="pplChip" hidden>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="14" width="5" height="7" rx="2"/><rect x="17" y="14" width="5" height="7" rx="2"/></svg>
                        Слушают: <b id="listeners">0</b>
                    </span>
                </div>
                <h1 class="word">TRP2<em>FM</em></h1>
                <p class="tag">Радио сообщества <b>Trinity GTA</b>. Живые эфиры, музыка круглые сутки и треки по вашим заявкам.</p>

                <div class="cta">
                    <button class="btn btn-main" type="button" data-play>
                        <svg class="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6a.6.6 0 0 0 .92.5l10.6-6.8a.6.6 0 0 0 0-1L8.92 4.7A.6.6 0 0 0 8 5.2z"/></svg>
                        <svg class="i-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.2"/></svg>
                        <span class="t-off">Слушать эфир</span><span class="t-on">Остановить</span>
                    </button>
                    <a class="btn btn-ghost" href="<?php echo $ORDER_URL; ?>" target="_blank" rel="noopener">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        Заказать трек
                    </a>
                    <a class="btn btn-ghost" href="#app">Приложение</a>
                </div>
                <div class="facts"><span><b>24/7</b> в эфире</span><span><b>Stereo</b> поток</span><span>iOS · Android</span></div>
            </div>

            <div class="np card">
                <div class="np-glow" id="coverGlow"></div>
                <div class="np-art">
                    <div class="vinyl" aria-hidden="true"></div>
                    <div class="cover">
                        <div data-myinfo="logo" style="display:none;"></div>
                        <div data-myinfo="img"></div>
                    </div>
                    <button class="np-play" type="button" data-play aria-label="Слушать или остановить эфир">
                        <svg class="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6a.6.6 0 0 0 .92.5l10.6-6.8a.6.6 0 0 0 0-1L8.92 4.7A.6.6 0 0 0 8 5.2z"/></svg>
                        <svg class="i-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.2"/></svg>
                    </button>
                </div>
                <div class="np-body">
                    <div class="np-k"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>Сейчас играет · DJ <span data-myinfo="djname"></span></span></div>
                    <div class="np-t" id="nowT"><div class="now-track" id="nowTrack">TRP2FM</div></div>
                    <div class="np-a" id="nowArtist">Радио Trinity GTA</div>
                    <!-- сюда плеер пишет «Артист - Трек»; на странице текст разбирается на две строки -->
                    <span id="songSrc" data-myinfo="song" hidden></span>
                </div>
            </div>
        </section>
    </main>

    <div class="band" aria-hidden="true"><div class="band-in" id="band"></div></div>

    <!-- ЖУРНАЛ + СОЦСЕТИ -->
    <section class="wrap sec" id="air">
        <div class="kicker">Эфир</div>
        <h2 class="big rv">Что звучит <em>прямо сейчас</em></h2>
        <div class="lower">
            <div class="card pane rv">
                <div class="h2row"><h2>История эфира</h2><small>последние треки</small></div>
                <div class="scroll-log">
                    <div class="my_lastsongs" data-revert=1 id="log">
                        <div class="my_lastsonghtml" style="display:none;">
                            <a class="logrow" href="https://www.youtube.com/results?search_query=%songencode%" target="_blank" rel="noopener" title="Найти на YouTube">
                                <img src="https://myradio24.com/%songcover%" alt="" loading="lazy" onerror="this.onerror=null;this.src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='">
                                <span class="nm">%song%</span>
                                <time>%songtime%</time>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="side">
                <div class="card pane rv" style="--d:.08s">
                    <div class="h2row"><h2>На связи</h2><small>соцсети</small></div>
                    <p class="about"><b>TRP2FM</b> — радио сообщества Trinity GTA. Слушай любимые треки онлайн, заказывай музыку и оставайся на связи с нами.</p>
                    <div class="freqs">
                        <a href="https://vk.com/radiotrp2fm" target="_blank" rel="noopener"><span class="ico" style="--c:#0077ff"><img src="/imgs/vkicon.png" alt="" onerror="this.parentNode.classList.add('noimg'); this.remove()"><b>VK</b></span><span class="t">ВКонтакте<small>vk.com/radiotrp2fm</small></span><span class="ar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
                        <a href="https://t.me/trp2fm" target="_blank" rel="noopener"><span class="ico" style="--c:#229ed9"><img src="/imgs/telegramicon.png" alt="" onerror="this.parentNode.classList.add('noimg'); this.remove()"><b>TG</b></span><span class="t">Telegram<small>t.me/trp2fm</small></span><span class="ar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
                        <a href="http://gta-trinity.com" target="_blank" rel="noopener"><span class="ico" style="--c:linear-gradient(135deg,#8b5cf6,#ff4fd8)"><img src="/imgs/trinityicon.png" alt="" onerror="this.parentNode.classList.add('noimg'); this.remove()"><b>TR</b></span><span class="t">Trinity GTA<small>gta-trinity.com</small></span><span class="ar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
                    </div>
                </div>
                <div class="card pane order rv" style="--d:.16s">
                    <h3>Хочешь свой трек в эфире?</h3>
                    <p>Выбери песню в столе заказов — и она прозвучит на TRP2FM.</p>
                    <a class="btn" href="<?php echo $ORDER_URL; ?>" target="_blank" rel="noopener">Заказать трек</a>
                </div>
            </div>
        </div>
    </section>

    <!-- ПРИЛОЖЕНИЕ -->
    <section class="wrap sec" id="app">
        <div class="app card rv">
            <div>
                <div class="kicker">Приложение</div>
                <h2 class="big">Радио <em>в кармане</em></h2>
                <p class="lede"><b>MyRadio24</b> — бесплатное приложение для iOS и Android. Слушай TRP2FM в дороге, на учёбе, дома и везде, где удобно.</p>
                <ol class="steps">
                    <li><div><b>Скачай MyRadio24</b><span>В App Store или Google Play — кнопки ниже.</span></div></li>
                    <li><div><b>Найди TRP2FM</b><span>Просто введи в поиске приложения <b>TRP2FM</b>.</span></div></li>
                    <li><div><b>Слушай где угодно</b><span>Эфир 24/7 — тот же, что на сайте.</span></div></li>
                </ol>
                <div class="stores">
                    <a class="store" href="https://apps.apple.com/us/app/myradio24/id1487953526" target="_blank" rel="noopener">
                        <img src="<?php echo $APP_STORE; ?>" alt="" onerror="this.remove()">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.500 1.100 8.600.7 1 1.600 2.200 2.700 2.200 1.100 0 1.500-.7 2.800-.7 1.300 0 1.700.7 2.800.7 1.200 0 1.900-1 2.600-2.100.800-1.200 1.200-2.400 1.200-2.400-.100-.100-2.300-.900-2.300-3.500zM14.300 6.100c.6-.7 1-1.700.9-2.700-.900.100-1.900.6-2.500 1.300-.5.6-1 1.600-.9 2.600 1 .1 1.900-.5 2.500-1.200z"/></svg>
                        <span><small>Загрузить в</small><b>App Store</b></span>
                    </a>
                    <a class="store" href="https://play.google.com/store/apps/details?id=com.myradio24.player" target="_blank" rel="noopener">
                        <img src="<?php echo $GOOGLE_PLAY; ?>" alt="" onerror="this.remove()">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.5 3.3v17.4c0 .5.5.8.9.5l15-8.700c.400-.200.400-.800 0-1L5.400 2.800c-.4-.3-.9 0-.9.5z"/></svg>
                        <span><small>Доступно в</small><b>Google Play</b></span>
                    </a>
                </div>
            </div>
            <div class="phones" aria-hidden="true">
                <div class="phone p2"><img src="<?php echo $APP_SHOT_2; ?>" alt="" loading="lazy" onerror="this.parentNode.classList.add('noimg'); this.remove()"></div>
                <div class="phone p1"><img src="<?php echo $APP_SHOT_1; ?>" alt="" loading="lazy" onerror="this.parentNode.classList.add('noimg'); this.remove()"></div>
            </div>
        </div>
    </section>

    <!-- КОМАНДА / ВАКАНСИИ -->
    <section class="wrap sec" id="team">
        <div class="kicker">Вакансии · Команда TRP2FM</div>
        <h2 class="big rv">Ищем <em>голоса</em> эфира</h2>
        <div class="team">
            <div class="card rv">
                <p class="lede">Мы в поиске талантливых и харизматичных девушек и парней, готовых создавать атмосферу праздника для слушателей Trinity GTA. От нас — поддержка, крупные выплаты и различные бонусы на проекте.</p>
                <div class="reqs">
                    <span class="req">Качественный микрофон</span>
                    <span class="req">Стабильный интернет</span>
                    <span class="req">Готовность к регулярным эфирам</span>
                </div>
                <div class="warn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.4 17.500A2 2 0 0 0 4.100 20.500h15.800a2 2 0 0 0 1.700-3L13.700 3.900a2 2 0 0 0-3.400 0z"/></svg>Заявки без демо-записи рассматриваться не будут</div>
                <button class="btn btn-main" type="button" data-apply>Заполнить анкету радиоведущего</button>
                <p class="contact">По всем вопросам — в личные сообщения <a href="https://vk.com/radiotrp2fm" target="_blank" rel="noopener">группы TRP2FM ВКонтакте</a>.</p>
            </div>
            <div class="card rv" style="--d:.08s">
                <div class="steps-h">Как подать заявку</div>
                <ol class="steps">
                    <li><div><b>Запиши демо от 1 минуты</b><span>Представься, как будто ты уже в эфире, и зачитай несколько приветов (придумай сам или возьми из нашей группы). Формат MP3 или WAV, без обработки.</span></div></li>
                    <li><div><b>Загрузи запись</b><span>На файлообменник с бессрочным хранением — <a href="https://disk.yandex.ru" target="_blank" rel="noopener">disk.yandex.ru</a> или <a href="https://drive.google.com" target="_blank" rel="noopener">drive.google.com</a>.</span></div></li>
                    <li><div><b>Заполни анкету</b><span>Ссылку на демо вставь в последнее поле. Анкета откроется поверх страницы — эфир не прервётся.</span></div></li>
                </ol>
            </div>
        </div>
    </section>

    <footer class="wrap site-footer"><span><?php echo $COPY; ?></span><span>Радио сообщества Trinity GTA</span></footer>
</div>

<!-- АНКЕТА: отправляется в Google Forms через скрытый iframe, страница не перезагружается -->
<div class="scrim" id="scrim"></div>
<aside class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">
    <div class="sheet-h"><h3 id="sheetTitle">Анкета ведущего</h3><button class="x" id="sheetClose" type="button" aria-label="Закрыть">×</button></div>
    <div class="live-line"><i></i><span>Эфир продолжается:</span><b id="sheetNow"></b></div>
    <iframe name="gf_sink" id="gfSink" title="" style="display:none;"></iframe>
    <form class="form" id="form" action="https://docs.google.com/forms/d/e/1FAIpQLSdzp2g2ZbSumuDaTd97LsNTsTkMv_luXNYliAd3ipmydyCXag/formResponse" method="POST" target="gf_sink">
        <label for="f1">Имя<input id="f1" name="entry.726432518" placeholder="Ваше имя" autocomplete="given-name"></label>
        <label for="f2">Фамилия<input id="f2" name="entry.610967686" placeholder="Ваша фамилия" autocomplete="family-name"></label>
        <label for="f3">Часовой пояс<input id="f3" name="entry.1592934574" placeholder="Например, МСК+0"></label>
        <label for="f4">Возраст<input id="f4" name="entry.1808835389" inputmode="numeric" placeholder="Ваш возраст"></label>
        <label for="f5">Ссылка на VK<input id="f5" name="entry.1427398125" placeholder="vk.com/…"></label>
        <label for="f6">Ник в Discord<input id="f6" name="entry.530752712" placeholder="Ник аккаунта"></label>
        <label for="f7">Игровой ник и сервер<input id="f7" name="entry.1877269070" placeholder="Ник и сервер"></label>
        <label for="f8">Псевдоним в эфире<input id="f8" name="entry.998569616" placeholder="Придумайте псевдоним"></label>
        <label for="f9">О себе в 3 предложениях<input id="f9" name="entry.958949332" placeholder="Коротко о себе"></label>
        <label for="f10">Ссылка на демо-запись<input id="f10" name="entry.1930955918" placeholder="disk.yandex.ru/… или drive.google.com/…" required></label>
        <button class="btn btn-main" type="submit">Отправить заявку</button>
    </form>
    <div class="done" id="done" hidden>
        <div class="t">Заявка отправлена</div>
        <p>Спасибо! Мы посмотрим анкету и демо-запись и свяжемся с тобой.</p>
        <button class="btn btn-ghost" type="button" id="doneClose">Вернуться к эфиру</button>
    </div>
</aside>

<!-- VISUALIZERS -->
<canvas id="visualizer1" class="my_visualizer" width=1920 height=150 data-size=16 data-revert=0 data-color="blue"></canvas>
<canvas id="visualizer2" class="my_visualizer" width=1920 height=150 data-size=16 data-revert=1 data-color="blue"></canvas>

<!-- PLAYER -->
<div class="player" id="dock">
    <div class="deck-now">
        <div class="mini" id="deckMini"></div>
        <div class="tx">
            <div class="k"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="t-on">В эфире</span><span class="t-off">TRP2FM · нажми play</span></div>
            <div class="n" id="deckName">TRP2FM</div>
            <div class="a" id="deckArtist"></div>
        </div>
    </div>
    <button class="vol-btn" id="volBtn" type="button" aria-label="Громкость" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.500 8.500a5 5 0 0 1 0 7M18.500 5.500a9 9 0 0 1 0 13"/></svg>
    </button>
    <div id="small-player">
        <div id="my_player_custom" class="my_player" data-player="custom" data-volume=30 data-autoplay=0 data-streamurl="https://myradio24.org/trp2fm"></div>
        <!-- шаблон, из которого скрипт myradio24 собирает плеер. Классы my_* менять нельзя. -->
        <div id="my_player_custom_html" style="display:none;" data-imagesurl="{'play':'imgs/btn_play.png','pause':'imgs/btn_stop.png'}">
            <div class="my_timer">00:00</div>
            <div class="pl-play">
                <svg class="i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.2v13.6a.6.6 0 0 0 .92.5l10.6-6.8a.6.6 0 0 0 0-1L8.92 4.7A.6.6 0 0 0 8 5.2z"/></svg>
                <svg class="i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.2"/></svg>
                <span class="i-spin" aria-hidden="true"></span>
                <div class="my_play" role="button" tabindex="0" aria-label="Слушать или остановить эфир"></div>
            </div>
            <div class="show-volume">
                <svg class="vol-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.500 8.500a5 5 0 0 1 0 7"/></svg>
                <div class="my_volumediv" title="Громкость">
                    <div class="my_volume"></div>
                    <div class="my_volumecursor"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://myradio24.com/player/player.js?v3.22" data-port="trp2fm" data-interval=15 data-vmid=0></script>
<script type="text/javascript" src="/js/jquery.js"></script>
<script type="text/javascript" src="/js/color.js"></script>
<script type="text/javascript" src="/js/nowplay.js"></script>
<script type="text/javascript" src="/js/listeners.js"></script>

<script>
(function(){
    var body = document.body, PAGE_TITLE = document.title;
    function $(s, r){ return (r || document).querySelector(s); }
    function $$(s, r){ return [].slice.call((r || document).querySelectorAll(s)); }

    /* ── мобильное меню ── */
    var mm = $('#mm'), mnav = $('#mobile-nav');
    function setMenu(open){ mnav.hidden = !open; mm.setAttribute('aria-expanded', String(open)); }
    mm.addEventListener('click', function(){ setMenu(mnav.hidden); });
    $$('a', mnav).forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });

    /* ── подсветка текущего раздела в меню и появление блоков ── */
    var spy = $$('.links [data-spy]');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function(es){
            es.forEach(function(e){
                if (e.isIntersecting) spy.forEach(function(a){ a.classList.toggle('cur', a.getAttribute('data-spy') === e.target.id); });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        ['top', 'air', 'app', 'team'].forEach(function(id){ var el = document.getElementById(id); if (el) io.observe(el); });
        var rio = new IntersectionObserver(function(es){
            es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
        }, { rootMargin: '0px 0px -8% 0px' });
        $$('.rv').forEach(function(el){ rio.observe(el); });
    } else { $$('.rv').forEach(function(el){ el.classList.add('in'); }); }

    /* ── кнопка плеера: «родная» .my_play создаётся скриптом myradio24 ── */
    function vendorPlay(){
        var all = $$('.my_play');
        for (var i = 0; i < all.length; i++) if (!all[i].closest('#my_player_custom_html')) return all[i];
        return all[0] || null;
    }
    var pendingT = 0;
    function markPending(){
        if (playing) return;
        body.classList.add('buf'); clearTimeout(pendingT);
        pendingT = setTimeout(function(){ body.classList.remove('buf'); }, 8000);
    }
    /* большие кнопки «Слушать эфир» нажимают ту же кнопку плеера */
    $$('[data-play]').forEach(function(b){
        b.addEventListener('click', function(){ var p = vendorPlay(); if (p) { markPending(); p.click(); setTimeout(updateState, 150); } });
    });
    document.addEventListener('click', function(e){ if (e.target.closest && e.target.closest('.my_play')) { markPending(); setTimeout(updateState, 150); } });
    document.addEventListener('keydown', function(e){
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('my_play')) { e.preventDefault(); e.target.click(); }
    });

    /* ── состояние «играет / стоп» ── */
    var playing = false;
    function detectPlaying(){
        var m = (window.__trpMedia || []).concat($$('audio, video'));
        for (var i = 0; i < m.length; i++) if (!m[i].paused && !m[i].ended) return true;
        /* запасной способ: плеер сам меняет картинку на кнопке (btn_play → btn_stop) */
        var p = vendorPlay();
        if (p) { var bg = p.style.backgroundImage || ''; if (/stop|pause/i.test(bg)) return true; }
        return false;
    }
    function updateState(){
        var now = detectPlaying();
        if (now === playing) return;
        playing = now;
        body.classList.toggle('on', playing); body.classList.toggle('off', !playing);
        if (playing) { clearTimeout(pendingT); }
        body.classList.remove('buf');
        setTitle();
        if ('mediaSession' in navigator) { try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'; } catch (e) {} }
    }
    setInterval(updateState, 500);
    function watchMedia(el){
        ['play', 'playing', 'pause', 'ended', 'emptied', 'error', 'abort'].forEach(function(ev){ el.addEventListener(ev, function(){ setTimeout(updateState, 30); }); });
        el.addEventListener('waiting', function(){ if (!el.paused) body.classList.add('buf'); });
        el.addEventListener('playing', function(){ body.classList.remove('buf'); });
    }
    (window.__trpMedia || []).forEach(watchMedia);
    document.addEventListener('trp:media', function(e){ watchMedia(e.detail); });

    /* ── текущий трек: делим «Артист - Трек», раздаём по странице; длинное название плавно едет ── */
    var songSrc = $('#songSrc'), cur = { title: '', artist: '' };
    function esc(s){ var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    function fitNow(){
        var box = $('#nowT'), tr = $('#nowTrack');
        box.classList.remove('scroll');
        var over = tr.scrollWidth - box.clientWidth;
        if (over > 4) {
            box.style.setProperty('--dist', over + 'px');
            box.style.setProperty('--dur', Math.max(6, over / 24 + 5) + 's');
            void box.offsetWidth; box.classList.add('scroll');
        }
    }
    function setTitle(){ document.title = (playing && cur.title) ? '▶ ' + cur.title + (cur.artist ? ' — ' + cur.artist : '') + ' · TRP2FM' : PAGE_TITLE; }
    function coverUrl(){ var m = /url\(["']?([^"')]+)["']?\)/.exec(lastBg || ''); return m ? m[1] : ''; }
    function setMediaMeta(){
        if (!('mediaSession' in navigator) || !window.MediaMetadata) return;
        try {
            var art = coverUrl();
            navigator.mediaSession.metadata = new MediaMetadata({ title: cur.title || 'TRP2FM', artist: cur.artist || 'Радио Trinity GTA', album: 'TRP2FM',
                artwork: art ? [{ src: art, sizes: '512x512' }] : [] });
        } catch (e) {}
    }
    function syncSong(){
        var s = (songSrc.textContent || '').trim(), p = s.indexOf(' - ');
        cur.artist = p > 0 ? s.slice(0, p) : '';
        cur.title  = p > 0 ? s.slice(p + 3) : s;
        $('#nowTrack').textContent   = cur.title || 'TRP2FM';
        $('#nowArtist').textContent  = cur.artist || (cur.title ? '' : 'Радио Trinity GTA');
        $('#deckName').textContent   = cur.title || 'TRP2FM';
        $('#deckArtist').textContent = cur.artist;
        $('#sheetNow').textContent   = s || '—';
        var html = '', label = s ? esc(s) : 'Радио Trinity GTA';
        for (var k = 0; k < 2; k++) html += '<span>Сейчас в эфире <i>✦</i></span><span>' + label + ' <i>✦</i></span><span>Заказывай треки <i>✦</i></span><span>TRP2FM · Trinity GTA <i>✦</i></span>';
        $('#band').innerHTML = html;
        fitNow(); setTitle(); setMediaMeta();
    }
    syncSong();
    new MutationObserver(function(){ setTimeout(syncSong, 50); }).observe(songSrc, { childList: true, characterData: true, subtree: true });
    window.addEventListener('resize', fitNow);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNow);

    /* ── обложка: свечение и мини-обложка в плеере берут картинку из карточки ── */
    var lastBg = '';
    function syncCover(){
        var src = $('.cover [data-myinfo="img"]');
        if (!src) return;
        var bg = src.style.backgroundImage || getComputedStyle(src).backgroundImage;
        if (bg && bg !== 'none' && bg !== lastBg) {
            lastBg = bg;
            $('#coverGlow').style.backgroundImage = bg;
            $('#deckMini').style.backgroundImage = bg;
            setMediaMeta();
        }
    }
    setInterval(syncCover, 1000); syncCover();

    /* ── счётчик слушателей показываем, только когда он пришёл ── */
    var lst = $('#listeners'), chip = $('#pplChip');
    function syncListeners(){ chip.hidden = !(parseInt(lst.textContent, 10) > 0); }
    new MutationObserver(syncListeners).observe(lst, { childList: true, characterData: true, subtree: true });

    /* ── история эфира: «Артист - Трек» в две строки, первая строка — «в эфире» ── */
    var log = $('#log');
    function decorateLog(){
        var real = $$('a.logrow', log).filter(function(a){ var t = a.closest('.my_lastsonghtml'); return !t || t.style.display !== 'none'; });
        real.forEach(function(a, i){
            a.classList.toggle('live', i === 0);
            var nm = $('.nm', a);
            if (nm && !nm.getAttribute('data-done')) {
                var t = (nm.textContent || '').trim(), p = t.indexOf(' - ');
                if (p > 0) {
                    nm.textContent = t.slice(p + 3);
                    var sm = document.createElement('small'); sm.textContent = t.slice(0, p); nm.appendChild(sm);
                }
                nm.setAttribute('data-done', '1');
            }
            var sm2 = nm && $('small', nm);
            if (sm2) {
                var base = sm2.getAttribute('data-a') || sm2.textContent.replace(/^● в эфире · /, '');
                sm2.setAttribute('data-a', base);
                sm2.textContent = i === 0 ? '● в эфире · ' + base : base;
            }
        });
    }
    new MutationObserver(function(){ setTimeout(decorateLog, 30); }).observe(log, { childList: true, subtree: true });
    decorateLog();

    /* ── громкость на телефоне: кнопка открывает панель над плеером ── */
    var dock = $('#dock'), volBtn = $('#volBtn');
    function setVol(open){ dock.classList.toggle('vol-open', open); volBtn.setAttribute('aria-expanded', String(open)); }
    volBtn.addEventListener('click', function(e){ e.stopPropagation(); setVol(!dock.classList.contains('vol-open')); });
    document.addEventListener('click', function(e){ if (dock.classList.contains('vol-open') && !e.target.closest('.show-volume')) setVol(false); });
    /* палец → мышь: регулятор громкости плеера рассчитан на мышь, поэтому касания переводим в события мыши */
    (function(){
        var active = null;
        function fire(type, t, target){
            target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window, clientX: t.clientX, clientY: t.clientY, screenX: t.screenX, screenY: t.screenY, button: 0, buttons: type === 'mouseup' || type === 'click' ? 0 : 1 }));
        }
        function bar(x, y){ var el = document.elementFromPoint(x, y); return el && el.closest ? el.closest('.my_volumediv') : null; }
        document.addEventListener('touchstart', function(e){
            var t = e.touches[0], b = e.target.closest && e.target.closest('.my_volumediv');
            if (!b || !t) return;
            active = b; e.preventDefault(); fire('mousedown', t, b); fire('mousemove', t, b);
        }, { passive: false });
        document.addEventListener('touchmove', function(e){
            if (!active) return; e.preventDefault();
            var t = e.touches[0], r = active.getBoundingClientRect();
            /* держим точку внутри полоски, чтобы громкость не «улетала» за края */
            var x = Math.min(r.right - 1, Math.max(r.left + 1, t.clientX));
            fire('mousemove', { clientX: x, clientY: r.top + r.height / 2, screenX: t.screenX, screenY: t.screenY }, active);
            active._last = { clientX: x, clientY: r.top + r.height / 2, screenX: t.screenX, screenY: t.screenY };
        }, { passive: false });
        function end(e){
            if (!active) return;
            var t = active._last || e.changedTouches[0];
            fire('mouseup', t, active); fire('click', t, active);
            active._last = null; active = null;
        }
        document.addEventListener('touchend', end); document.addEventListener('touchcancel', end);
    })();

    /* ── анкета ── */
    var sheet = $('#sheet'), scrim = $('#scrim'), form = $('#form'), done = $('#done'), lastFocus = null, sent = false;
    function openSheet(){
        lastFocus = document.activeElement;
        sheet.classList.add('open'); scrim.classList.add('open'); body.style.overflow = 'hidden';
        setTimeout(function(){ var f = $('#f1'); if (f && !form.hidden && window.matchMedia('(min-width: 641px)').matches) f.focus({ preventScroll: true }); }, 400);
    }
    function closeSheet(){
        sheet.classList.remove('open'); scrim.classList.remove('open'); body.style.overflow = '';
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
        if (location.hash === '#apply') history.replaceState(null, '', '#team');
    }
    $$('[data-apply]').forEach(function(b){ b.addEventListener('click', openSheet); });
    $('#sheetClose').addEventListener('click', closeSheet);
    scrim.addEventListener('click', closeSheet);
    document.addEventListener('keydown', function(e){
        if (e.key !== 'Escape') return;
        if (sheet.classList.contains('open')) closeSheet(); else if (!mnav.hidden) setMenu(false); else setVol(false);
    });
    form.addEventListener('submit', function(){ sent = true; });
    $('#gfSink').addEventListener('load', function(){
        if (!sent) return;
        sent = false; form.reset(); form.hidden = true; done.hidden = false;
    });
    $('#doneClose').addEventListener('click', function(){
        closeSheet();
        setTimeout(function(){ form.hidden = false; done.hidden = true; }, 500);
    });
    /* старая ссылка radiolive.php ведёт сюда с #apply — сразу открываем анкету */
    if (location.hash === '#apply') {
        var team = document.getElementById('team');
        if (team) team.scrollIntoView();
        setTimeout(openSheet, 300);
    }
})();
</script>
</body>
</html>
