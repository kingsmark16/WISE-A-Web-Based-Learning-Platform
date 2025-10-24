export function buildCertificateHTML({
  studentName,
  courseTitle,
  certificateNumber,
  qrDataUrl,
  bgDataUrl = "",
}) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page {
    size: A4 landscape;
    margin: 0;
  }
  html, body {
    margin: 0;
    padding: 0;
  }

  /* Typography to match your Canva look */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

  body {
    width: 1123px;
    height: 794px;
    background: #fff;
    position: relative;
    overflow: hidden;
    color: #000;
    -webkit-font-smoothing: antialiased;
    font-family: "Playfair Display", Georgia, serif;
  }

  /* background: full certificate design image */
  .bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; /* scale to fill the A4 landscape canvas */
    z-index: 0;
  }

  .overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
  }

  .student-name {
    position: absolute;
    left: 620px;    /* move left/right if needed */
    top: 200px;     /* move up/down if needed, pag halangkaw pababa */
    max-width: 480px;

    font-size: 28px;
    font-weight: 700;
    font-family: "Playfair Display", Georgia, serif;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    /* no underline here; line already exists in bg */
  }

  .course-title {
    position: absolute;
    left: 385px;   /* nudge left/right if it's not starting at that block */
    top: 382px;    /* nudge up/down to sit just above the thick bar, 385px dukot na sa line */
    max-width: 700px;

    font-size: 20px;
    font-weight: 700;
    font-family: "Playfair Display", Georgia, serif;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .verify-text {
    position: absolute;
    left: 825px;
    top: 560px;
    font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont,
                 "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.4;
    color: #000;
    max-width: 250px;
    text-align: left;
    word-break: break-word;
  }

  .qr-box {
    position: absolute;
    left: 825px;
    top: 580px;
    width: 130px;
    height: 130px;
    background: #fff;
    border: 2px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qr-box img {
    width: 118px;
    height: 118px;
    display: block;
  }

</style>
</head>
<body>

  ${bgDataUrl ? `<img class="bg" src="${bgDataUrl}" alt="Certificate background" />` : ""}

  <div class="overlay">
    ${
      studentName
        ? `<div class="student-name">${esc(studentName)}</div>`
        : ""
    }

    ${
      courseTitle
        ? `<div class="course-title">${esc(courseTitle)}</div>`
        : ""
    }

    ${
      certificateNumber
        ? `<div class="verify-text">Verify: ${esc(certificateNumber)}</div>`
        : ""
    }

    ${
      qrDataUrl
        ? `<div class="qr-box"><img src="${qrDataUrl}" alt="QR Code" /></div>`
        : ""
    }
  </div>

</body>
</html>`;
}

function esc(s = "") {
  return String(s).replace(/[&<>'"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[c]));
}
