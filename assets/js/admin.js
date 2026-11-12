(function () {
  "use strict";
  // 삭제 확인
  document.querySelectorAll("form[data-confirm]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      if (!window.confirm(f.getAttribute("data-confirm"))) e.preventDefault();
    });
  });

  // 이미지 미리보기 + 끌어다 놓기 (한 화면에 여러 개 있을 수 있다)
  document.querySelectorAll(".drop").forEach(function (drop) {
    var input = drop.querySelector('input[type="file"]');
    var img = drop.querySelector("[data-preview]") || document.getElementById("preview");
    var msg = drop.querySelector(".drop__msg");
    if (!input || !img) return;
    function show(file) {
      if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return;
      img.src = URL.createObjectURL(file); img.hidden = false; img.alt = "새 이미지 미리보기";
      if (msg) msg.hidden = true;
      drop.classList.add("is-new");
    }
    input.addEventListener("change", function () { show(input.files[0]); });
    ["dragenter", "dragover"].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("is-over"); });
    });
    ["dragleave", "drop"].forEach(function (t) {
      drop.addEventListener(t, function () { drop.classList.remove("is-over"); });
    });
    drop.addEventListener("drop", function (e) {
      e.preventDefault();
      var f = e.dataTransfer.files[0];
      if (!f) return;
      var dt = new DataTransfer(); dt.items.add(f); input.files = dt.files;
      show(f);
    });
  });
})();
