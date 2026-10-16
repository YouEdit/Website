(async function buildWebsite() {
  const fs=await import("node:fs/promises");
  const path=await import("node:path");
  const site=JSON.parse(await fs.readFile("content/site.json","utf8"));
  const works=JSON.parse(await fs.readFile("content/works.json","utf8"));
  const root=path.resolve("dist");
  const esc=(s="")=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const videoId=url=>{
    try{const u=new URL(url);if(u.hostname==="youtu.be")return /^[\w-]{11}$/.test(u.pathname.slice(1))?u.pathname.slice(1):"";if(!["youtube.com","www.youtube.com","m.youtube.com"].includes(u.hostname))return "";const m=u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/);const id=u.pathname==="/watch"?u.searchParams.get("v"):m?.[1];return /^[\w-]{11}$/.test(id||"")?id:"";}catch{return "";}
  };
  if(!site.url?.startsWith("https://"))throw Error("site.json: HTTPS URL が必要です");
  if(!Array.isArray(works)||!works.length)throw Error("works.json: 作品配列が必要です");
  const used=new Set();
  for(const w of works){
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(w.slug)||used.has(w.slug)||!videoId(w.youtubeUrl))throw Error("不正な作品データ: "+JSON.stringify(w));
    used.add(w.slug);
  }
  const clean=site.url.replace(/\/+$/,"");
  const nav=[["/","ホーム"],["/works/","作品"],["/about/","YouEditについて"],["/contact/","お問い合わせ"]];
  const thumb=w=>`https://i.ytimg.com/vi/${videoId(w.youtubeUrl)}/hqdefault.jpg`;
  const socials=[site.instagram?`<a href="${esc(site.instagram)}" target="_blank" rel="noopener noreferrer">Instagram ↗</a>`:""].filter(Boolean).join("");
  const header=active=>`<a href="#main" class="skip">本文へ移動</a><header class="header"><div class="wrap header-inner"><a class="logo" href="/"><img src="/assets/logo-header.png" alt="YouEdit" width="78" height="64"></a><button type="button" class="menu-button" aria-expanded="false" aria-controls="navigation" aria-label="メニューを開く"><span></span><span></span></button><nav class="nav" id="navigation">${nav.map(([u,t])=>`<a href="${u}" ${u===active?'aria-current="page"':""}>${t}</a>`).join("")}</nav></div></header>`;
  const footer=`<footer class="footer"><div class="wrap"><div class="footer-upper"><div><a href="/" class="footer-logo"><img src="/assets/logo-header.png" alt="YouEdit" width="78" height="64"></a><p>映像制作チーム YouEdit</p></div><div class="footer-links"><a href="/works/">作品</a><a href="/about/">チームについて</a><a href="/contact/">お問い合わせ</a>${socials}</div></div><div class="footer-lower"><span>© ${new Date().getFullYear()} YouEdit</span><a href="/privacy/">プライバシーポリシー</a></div></div></footer>`;

  // Brand identity for Google Search; these are factual YouEdit profile values.
  const structuredData=JSON.stringify({
    "@context":"https://schema.org",
    "@graph":[
      {"@type":"WebSite","@id":clean+"/#website","url":clean+"/","name":"YouEdit","alternateName":["ユーエディット","You Edit"],"inLanguage":"ja","description":site.description,
        "publisher":{"@id":clean+"/#organization"}},
      {"@type":"Organization","@id":clean+"/#organization","name":"YouEdit","alternateName":"ユーエディット","url":clean+"/","description":site.description,"email":site.email,
        ...(site.instagram?{"sameAs":[site.instagram]}:{})}
    ]
  }).replace(/</g,"\\u003c");
  const head=(p,title,desc,noindex=false)=>`<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#fafaf8"><title>${esc(title?`${title} | YouEdit（ユーエディット）`:"YouEdit（ユーエディット）｜映像制作チーム")}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${clean+p}"><meta property="og:title" content="${esc(title?`${title} | YouEdit（ユーエディット）`:"YouEdit（ユーエディット）｜映像制作チーム")}"><meta property="og:site_name" content="YouEdit"><meta property="og:locale" content="ja_JP"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${clean+p}"><meta property="og:image" content="https://i.ytimg.com/vi/JSInZNgyNCw/hqdefault.jpg"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/favicon.png" type="image/png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><link rel="stylesheet" href="/assets/style.css"><script defer src="/assets/app.js"></script>${p==="/"?`<script type="application/ld+json">${structuredData}</script>`:""}${noindex?'<meta name="robots" content="noindex,follow">':""}`;
  const page=(pathname,title,description,content,active="",noindex=false)=>`<!doctype html><html lang="ja"><head>${head(pathname,title,description,noindex)}</head><body>${header(active)}<main id="main">${content}</main>${footer}</body></html>`;
  const player=(id,title)=>`<button type="button" class="video-poster" data-video-id="${id}" data-video-title="${esc(title)}" aria-label="${esc(title)} を再生"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="${esc(title)} の動画サムネイル" loading="lazy" width="480" height="360"><span class="play" aria-hidden="true">▶</span></button>`;
  const card=w=>`<a class="work-card" href="/works/${w.slug}/" data-category="${esc(w.category)}"><div class="card-image"><img src="${thumb(w)}" alt="${esc(w.title)} のサムネイル" loading="lazy" width="480" height="360"></div><div class="card-body"><div><h3>${esc(w.title)}</h3><p>${esc(w.subtitle)}</p></div><span aria-hidden="true">↗</span></div></a>`;
  const eyebrow=t=>`<p class="eyebrow">${esc(t)}</p>`;
  const top=`<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">${eyebrow("YouEdit / Creative Team")}<h1>${esc(site.hero)}</h1><p class="lead">「${esc(site.concept)}」をコンセプトに。<br>これまでの作品と、チームについて紹介します。</p><div class="actions"><a class="button" href="/works/">作品を見る <span aria-hidden="true">→</span></a><a class="text-link" href="/about/">YouEditについて</a></div></div><div class="hero-media">${player(videoId(works[0].youtubeUrl),works[0].title)}<p class="media-caption">${esc(works[0].title)} / 映像作品</p></div></div></section><section class="section"><div class="wrap"><div class="section-head"><h2>制作した作品</h2><a class="text-link" href="/works/">すべての作品を見る →</a></div><div class="works-grid">${works.slice(0,3).map(card).join("")}</div></div></section><section class="section about-short"><div class="wrap about-short-grid"><div>${eyebrow("ABOUT")}<h2>YouEditについて</h2></div><div><p>${esc(site.description)}</p><a href="/about/" class="text-link">チームについて見る →</a></div></div></section><section class="section contact-short"><div class="wrap"><h2>お問い合わせ</h2><p>ご連絡はこちらからお送りください。</p><a class="button outline" href="/contact/">お問い合わせフォームへ →</a></div></section>`;
  const categoryButtons=["すべて",...new Set(works.map(w=>w.category))].map((t,i)=>`<button type="button" data-filter="${esc(i?"category":"all")}" data-value="${esc(i?t:"")}" ${i?'':'class="active" aria-pressed="true"'} ${i?'aria-pressed="false"':""}>${esc(t)}</button>`).join("");
  const archive=`<section class="page-head"><div class="wrap">${eyebrow("WORKS")}<h1>作品一覧</h1><p>これまでに制作した映像をまとめています。</p></div></section><section class="section archive-section"><div class="wrap"><div class="filters" role="group" aria-label="作品カテゴリー">${categoryButtons}</div><div class="works-grid" id="works-grid">${works.map(card).join("")}</div><p class="no-results" hidden>該当する作品はありません。</p></div></section>`;
  const about=`<section class="page-head"><div class="wrap">${eyebrow("ABOUT")}<h1>YouEditについて</h1><p>「${esc(site.concept)}」</p></div></section><section class="section"><div class="wrap info-grid"><h2>チームについて</h2><div><p>${esc(site.description)}</p><p>${esc(site.team)}</p><p class="muted">使用ソフト：${esc(site.software)}</p><div class="actions"><a class="button outline" href="/works/">作品を見る →</a><a href="/contact/" class="text-link">お問い合わせ</a></div></div></div></section>`;
  const contact=`<section class="page-head"><div class="wrap">${eyebrow("CONTACT")}<h1>お問い合わせ</h1><p>ご質問やご連絡はこちらからお送りください。</p></div></section><section class="section"><div class="wrap contact-grid"><aside><h2>ご連絡について</h2><p>内容を確認し、必要に応じてお返事します。</p><a href="mailto:${esc(site.email)}" class="contact-email">${esc(site.email)}</a></aside><form class="contact-form" name="contact" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="contact"><p class="hidden"><label>入力不要 <input name="bot-field" tabindex="-1" autocomplete="off"></label></p><label for="contact-name">お名前 <span>*</span></label><input id="contact-name" name="name" type="text" maxlength="100" autocomplete="name" required placeholder="お名前"><label for="contact-email">メールアドレス <span>*</span></label><input id="contact-email" name="email" type="email" maxlength="200" autocomplete="email" required placeholder="example@email.com"><label for="subject">件名 <span>*</span></label><input id="subject" name="subject" type="text" maxlength="180" required placeholder="お問い合わせについて"><label for="message">お問い合わせ内容 <span>*</span></label><textarea id="message" name="message" rows="7" maxlength="5000" required placeholder="内容をご入力ください"></textarea><label class="privacy"><input type="checkbox" name="privacy-consent" value="agree" required><span><a href="/privacy/" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>に同意する</span></label><button type="submit" class="button submit">送信する →</button><small>フォームの送信にはNetlify Formsを使用します。</small></form></div></section>`;
  const privacy=`<section class="page-head"><div class="wrap"><h1>プライバシーポリシー</h1></div></section><section class="section"><div class="wrap legal"><h2>取得する情報</h2><p>お問い合わせフォームから、お名前、メールアドレス、件名、お問い合わせ内容を取得します。</p><h2>利用目的</h2><p>取得した情報はお問い合わせへの対応と必要なご連絡に使用します。</p><h2>外部サービス</h2><p>フォームにはNetlify Forms、動画表示にはYouTubeを使用しています。それぞれのサービスのプライバシーポリシーをご確認ください。</p><h2>問い合わせ先</h2><p>個人情報の削除・取り扱いについては <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> までお問い合わせください。</p><h2>改定</h2><p>必要に応じて本方針を更新します。</p><p class="muted">最終更新：2026年10月</p></div></section>`;
  let files=[
    ["index.html",page("/","","映像制作チームYouEdit（ユーエディット）の公式サイト。すずき蓮根農園、本橋煎餅店、CUCINA CONTENTOなどの映像作品と、チームの紹介。",top,"/")],
    ["works/index.html",page("/works/","作品一覧","YouEditの映像制作作品一覧。",archive,"/works/")],
    ["about/index.html",page("/about/","YouEditについて",site.description,about,"/about/")],
    ["contact/index.html",page("/contact/","お問い合わせ","YouEditへのお問い合わせフォーム。",contact,"/contact/")],
    ["privacy/index.html",page("/privacy/","プライバシーポリシー","YouEditの個人情報の取り扱い。",privacy)],
    ["thanks/index.html",page("/thanks/","送信完了","","<section class='page-head'><div class='wrap'><h1>送信しました</h1><p>お問い合わせありがとうございます。</p><a href='/' class='button outline'>ホームに戻る →</a></div></section>","",true)],
    ["404.html",page("/404/","ページが見つかりません","","<section class='page-head'><div class='wrap'><h1>ページが見つかりません</h1><a href='/' class='button outline'>ホームに戻る →</a></div></section>","",true)]
  ];
  for(const w of works){
    const id=videoId(w.youtubeUrl);
    const body=`<section class="page-head project-head"><div class="wrap"><a href="/works/" class="text-link back">← 作品一覧へ戻る</a>${eyebrow(w.category+" / "+w.year)}<h1>${esc(w.title)}</h1><p>${esc(w.subtitle)}</p></div></section><section class="project-media wrap">${player(id,w.title)}</section><section class="section"><div class="wrap info-grid"><h2>作品について</h2><div><p>${esc(w.description)}</p><p class="muted">制作：YouEdit</p><a class="button outline" target="_blank" rel="noopener noreferrer" href="${esc(w.youtubeUrl)}">YouTubeで見る ↗</a></div></div></section>`;
    files.push([`works/${w.slug}/index.html`,page(`/works/${w.slug}/`,w.title,w.description,body,"/works/")]);
  }
  await fs.rm(root,{recursive:true,force:true});await fs.mkdir(root,{recursive:true});
  for(const [filename,html] of files){let dest=path.join(root,filename);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,html,"utf8");}
  await fs.cp("assets",path.join(root,"assets"),{recursive:true});
  const urls=files.filter(([f])=>!["404.html","thanks/index.html"].includes(f)).map(([f])=>clean+"/"+(f==="index.html"?"":f.replace(/index\.html$/,"")));
  await fs.writeFile(path.join(root,"sitemap.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${u}</loc></url>`).join("")}</urlset>`);
  await fs.writeFile(path.join(root,"robots.txt"),`User-agent: *\nAllow: /\nSitemap: ${clean}/sitemap.xml\n`);
  console.log(`Build complete: ${files.length} pages / ${works.length} works`);
})().catch(e=>{console.error(e);process.exitCode=1;});
