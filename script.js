(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Router berbasis hash ---------- */
  var routes = ["beranda", "saraf", "gerak", "alur", "kuis"];
  function route() {
    var h = (location.hash || "").slice(1);
    if (routes.indexOf(h) < 0) h = "beranda";
    $$("[data-route]").forEach(function (s) { s.hidden = s.dataset.route !== h; });
    $$("[data-nav]").forEach(function (a) {
      if (a.dataset.nav === h) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var active = $('[data-nav="' + h + '"]');
    if (active && active.scrollIntoView) { try { active.scrollIntoView({ block: "nearest", inline: "center" }); } catch (e) {} }
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();

  /* ---------- Tema ---------- */
  $("#theme-btn").addEventListener("click", function () {
    var root = document.documentElement;
    var cur = root.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    root.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
  });

  /* ---------- Sistem saraf ---------- */
  var saraf = {
    otak: {
      t: "Otak",
      f: "Pusat pengolahan informasi dan koordinasi tubuh. Otak menerima informasi dari reseptor, mengolahnya, lalu menentukan tanggapan.",
      c: "Setelah melihat buku di meja, otak memutuskan untuk mengambilnya dan mengatur gerakan lenganmu.",
      p: "Pada gerak sadar, otak mengolah informasi dan mengirim perintah ke otot."
    },
    sumsum: {
      t: "Sumsum tulang belakang",
      f: "Jalur penghantar impuls saraf antara otak dan tubuh, sekaligus pusat refleks tertentu.",
      c: "Saat tanganmu menyentuh benda panas, sumsum tulang belakang dapat langsung memerintahkan otot lengan untuk menarik tangan.",
      p: "Pada gerak refleks tertentu, sumsum tulang belakang memproses respons tanpa menunggu perintah sadar dari otak."
    },
    tepi: {
      t: "Saraf tepi",
      f: "Menghubungkan sistem saraf pusat dengan bagian tubuh. Ada saraf yang membawa informasi masuk dan ada yang membawa perintah keluar.",
      c: "Saraf di jari membawa sensasi sentuhan ke sistem saraf pusat, lalu saraf lain membawa perintah ke otot lengan.",
      p: "Menjadi kabel dua arah antara reseptor, sistem saraf pusat, dan efektor."
    }
  };
  function setSaraf(k) {
    var d = saraf[k];
    $("#s-title").textContent = d.t;
    $("#s-fungsi").textContent = d.f;
    $("#s-contoh").textContent = d.c;
    $("#s-peran").textContent = d.p;
    $("#body").setAttribute("data-active", k);
    $$(".seg button[data-k]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.k === k)); });
  }
  $$(".seg button[data-k]").forEach(function (b) { b.addEventListener("click", function () { setSaraf(b.dataset.k); }); });
  $$("#body .part").forEach(function (g) {
    var k = g.classList.contains("p-otak") ? "otak" : g.classList.contains("p-sumsum") ? "sumsum" : "tepi";
    g.style.cursor = "pointer";
    g.addEventListener("click", function () { setSaraf(k); });
  });
  setSaraf("otak");

  /* ---------- Alur gerak ---------- */
  var alur = {
    sadar: [
      ["in", "Rangsangan", "Kamu melihat buku di atas meja."],
      ["in", "Reseptor: mata", "Mata menangkap cahaya dari buku dan mengubahnya menjadi impuls saraf."],
      ["in", "Saraf sensorik", "Impuls dibawa menuju sistem saraf pusat."],
      ["center", "Otak", "Otak mengolah informasi dan memutuskan untuk mengambil buku."],
      ["center", "Sumsum tulang belakang", "Perintah dari otak diteruskan lewat sumsum tulang belakang."],
      ["out", "Saraf motorik", "Perintah dibawa ke otot lengan."],
      ["out", "Efektor: otot lengan", "Otot berkontraksi dan relaksasi bergantian, sendi siku dan bahu bergerak."],
      ["out", "Respons", "Tanganmu meraih dan mengambil buku."]
    ],
    refleks: [
      ["in", "Rangsangan", "Ujung jari menyentuh benda yang sangat panas (hanya ilustrasi)."],
      ["in", "Reseptor: kulit", "Reseptor di kulit mendeteksi panas dan mengirim impuls."],
      ["in", "Saraf sensorik", "Impuls dibawa langsung ke sumsum tulang belakang."],
      ["center", "Sumsum tulang belakang", "Bertindak sebagai pusat refleks. Respons diproses di sini tanpa menunggu perintah sadar dari otak."],
      ["out", "Saraf motorik", "Perintah cepat dibawa ke otot lengan."],
      ["out", "Efektor: otot lengan", "Otot lengan berkontraksi dan menarik tangan."],
      ["out", "Respons", "Tangan tertarik menjauh dari benda panas."],
      ["center", "Menyusul: otak", "Informasi juga sampai ke otak, sehingga kamu menyadari rasa panas setelah tangan bergerak.", true]
    ]
  };
  var mode = "sadar", pos = -1, timer = 0;
  function renderTrack() {
    var ol = $("#track");
    ol.innerHTML = "";
    alur[mode].forEach(function (s, i) {
      var li = document.createElement("li");
      li.className = "step" + (s[3] ? " side" : "");
      li.dataset.kind = s[0];
      li.innerHTML = '<span class="pin">' + (i + 1) + '</span><div class="box"><strong></strong><span></span></div>';
      $("strong", li).textContent = s[1];
      $(".box span", li).textContent = s[2];
      ol.appendChild(li);
    });
    paint();
  }
  function paint() {
    $$("#track .step").forEach(function (li, i) {
      li.classList.toggle("done", i < pos);
      li.classList.toggle("active", i === pos);
    });
  }
  function stopTimer() { clearInterval(timer); timer = 0; $("#a-play").textContent = "Jalankan simulasi"; }
  function advance() {
    if (pos < alur[mode].length - 1) { pos++; paint(); return true; }
    return false;
  }
  $("#a-next").addEventListener("click", function () { stopTimer(); if (!advance()) { pos = -1; paint(); } });
  $("#a-reset").addEventListener("click", function () { stopTimer(); pos = -1; paint(); });
  $("#a-play").addEventListener("click", function () {
    if (timer) { stopTimer(); return; }
    if (pos >= alur[mode].length - 1) pos = -1;
    $("#a-play").textContent = "Jeda";
    advance();
    timer = setInterval(function () { if (!advance()) stopTimer(); }, 1100);
  });
  $$(".seg button[data-m]").forEach(function (b) {
    b.addEventListener("click", function () {
      stopTimer(); mode = b.dataset.m; pos = -1;
      $$(".seg button[data-m]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      renderTrack();
    });
  });
  renderTrack();

  /* ---------- Kuis ---------- */
  var soal = [
    { q: "Bagian sistem saraf yang menjadi pusat pengolahan informasi dan koordinasi tubuh adalah ...", o: ["Sumsum tulang belakang", "Otak", "Saraf tepi", "Sendi"], a: 1, e: "Otak mengolah informasi dan mengoordinasikan tubuh. Sumsum tulang belakang dan saraf tepi lebih berperan sebagai jalur dan penghantar." },
    { q: "Fungsi sumsum tulang belakang adalah ...", o: ["Menyimpan kalsium untuk tulang", "Menghubungkan dua tulang", "Menjadi jalur penghantar impuls dan pusat refleks tertentu", "Menghasilkan kontraksi otot"], a: 2, e: "Sumsum tulang belakang menghantarkan impuls antara otak dan tubuh, serta memproses refleks tertentu." },
    { q: "Struktur yang menghubungkan tulang dan memungkinkan gerakan tertentu disebut ...", o: ["Otot", "Reseptor", "Sendi", "Efektor"], a: 2, e: "Sendi menjadi tempat pertemuan tulang. Contohnya sendi siku yang bergerak seperti engsel." },
    { q: "Saat lengan ditekuk, apa yang terjadi pada otot bisep dan trisep?", o: ["Bisep berkontraksi dan trisep relaksasi", "Bisep relaksasi dan trisep berkontraksi", "Keduanya berkontraksi penuh", "Keduanya tidak bekerja"], a: 0, e: "Otot bekerja berpasangan. Bisep memendek untuk menekuk lengan, sedangkan trisep memanjang dan relaksasi." },
    { q: "Urutan jalur refleks yang benar adalah ...", o: ["Rangsangan, otak, reseptor, otot", "Reseptor, rangsangan, saraf motorik, sumsum tulang belakang", "Rangsangan, reseptor, saraf sensorik, sumsum tulang belakang, saraf motorik, efektor", "Efektor, saraf sensorik, otak, reseptor"], a: 2, e: "Pada refleks, impuls dari reseptor lewat saraf sensorik ke sumsum tulang belakang, lalu saraf motorik membawa respons ke efektor." },
    { q: "Contoh gerak refleks adalah ...", o: ["Menulis catatan", "Berjalan ke kelas", "Menarik tangan saat tersentuh benda panas", "Mengambil buku dari meja"], a: 2, e: "Menarik tangan dari benda panas terjadi cepat dan tanpa menunggu perintah sadar dari otak." },
    { q: "Pada respons gerak, bagian yang berperan sebagai efektor adalah ...", o: ["Otot", "Mata", "Kulit", "Otak"], a: 0, e: "Efektor adalah bagian yang menghasilkan respons. Pada gerak, efektornya otot. Mata dan kulit adalah reseptor." },
    { q: "Saraf tepi berfungsi untuk ...", o: ["Melindungi organ dalam", "Menghubungkan sistem saraf pusat dengan bagian tubuh", "Menyimpan ingatan jangka panjang", "Menopang tubuh"], a: 1, e: "Saraf tepi membawa impuls dari tubuh ke sistem saraf pusat dan membawa perintah dari pusat ke tubuh." }
  ];
  var qi = 0, skor = 0, answered = false, salah = [];
  var K = ["A", "B", "C", "D"];
  function show(id, on) { var el = $(id); el.hidden = !on; el.style.display = on ? "flex" : "none"; }
  function startQuiz() {
    qi = 0; skor = 0; salah = [];
    show("#q-start", false); show("#q-end", false); show("#q-run", true);
    renderQ();
  }
  function renderQ() {
    var d = soal[qi]; answered = false;
    $("#q-count").textContent = "Soal " + (qi + 1) + " dari " + soal.length;
    $("#q-score").textContent = "Skor " + skor;
    $("#q-bar").style.width = (qi / soal.length * 100) + "%";
    $("#q-text").textContent = d.q;
    var box = $("#q-opts"); box.innerHTML = "";
    d.o.forEach(function (t, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "opt";
      b.innerHTML = '<span class="k">' + K[i] + '</span><span></span>';
      b.children[1].textContent = t;
      b.addEventListener("click", function () { pick(i); });
      box.appendChild(b);
    });
    $("#q-fb").hidden = true;
    $("#q-next").hidden = true;
    $("#q-next").textContent = qi === soal.length - 1 ? "Lihat skor" : "Lanjut";
  }
  function pick(i) {
    if (answered) return;
    answered = true;
    var d = soal[qi], ok = i === d.a;
    if (ok) skor++; else salah.push(qi);
    $$("#q-opts .opt").forEach(function (b, j) {
      b.disabled = true;
      if (j === d.a) b.classList.add("correct");
      else if (j === i) b.classList.add("wrong");
    });
    var fb = $("#q-fb");
    fb.innerHTML = "<b></b><span></span>";
    $("b", fb).textContent = ok ? "Jawabanmu benar." : "Jawabanmu belum tepat. Jawaban yang benar: " + K[d.a] + ".";
    $("span", fb).textContent = d.e;
    fb.hidden = false;
    $("#q-score").textContent = "Skor " + skor;
    $("#q-bar").style.width = ((qi + 1) / soal.length * 100) + "%";
    $("#q-next").hidden = false;
    $("#q-next").focus();
  }
  function finish() {
    show("#q-run", false); show("#q-end", true);
    var pct = Math.round(skor / soal.length * 100);
    $("#e-score").textContent = skor + " / " + soal.length;
    var msg = pct >= 85 ? "Pemahamanmu sudah kuat. Kamu siap menjelaskan alur gerak kepada temanmu."
      : pct >= 60 ? "Pemahamanmu sudah baik. Ulangi bagian yang masih salah di bawah ini."
      : "Pelajari lagi modul sistem saraf, sistem gerak, dan alur gerak, lalu coba kuis ini sekali lagi.";
    $("#e-msg").textContent = msg + " (" + pct + "%)";
    var r = $("#e-review"); r.innerHTML = "";
    if (salah.length) {
      var h = document.createElement("p"); h.className = "label"; h.textContent = "Perlu diulang"; h.style.marginBottom = "8px";
      var ul = document.createElement("ul"); ul.className = "review";
      salah.forEach(function (i) {
        var li = document.createElement("li"), d = soal[i];
        li.innerHTML = "<b></b><small></small>";
        $("b", li).textContent = d.q;
        $("small", li).textContent = "Jawaban benar: " + d.o[d.a];
        ul.appendChild(li);
      });
      r.appendChild(h); r.appendChild(ul);
    }
  }
  $("#q-go").addEventListener("click", startQuiz);
  $("#q-again").addEventListener("click", startQuiz);
  $("#q-next").addEventListener("click", function () {
    if (qi < soal.length - 1) { qi++; renderQ(); } else finish();
  });
  show("#q-run", false); show("#q-end", false); show("#q-start", true);
})();