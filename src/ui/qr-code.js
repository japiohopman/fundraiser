/**
 * Pure JavaScript Standalone QR Code Generator (Version 5-L, 37x37 matrix)
 * Generates an accessible, clean SVG string for any URL up to ~106 bytes without external dependencies.
 */
export class QRCodeGen {
  static createSVG(text) {
    const bytes = new TextEncoder().encode(text);
    const dataCWCount = 108;
    const ecCWCount = 26;
    const N = 37;

    if (bytes.length > 106) {
      throw new Error("Text too long for Version 5 QR Code");
    }

    // 1. Bit Buffer & Data Codewords
    const data = new Uint8Array(dataCWCount);
    let bitPos = 0;

    const writeBits = (val, num) => {
      for (let i = num - 1; i >= 0; i--) {
        const bit = (val >> i) & 1;
        const byteIdx = Math.floor(bitPos / 8);
        const bitIdx = 7 - (bitPos % 8);
        if (bitIdx >= 0 && byteIdx < dataCWCount) {
          if (bit) data[byteIdx] |= (1 << bitIdx);
        }
        bitPos++;
      }
    };

    // Mode: Byte (0100)
    writeBits(0b0100, 4);
    // Count: 8 bits
    writeBits(bytes.length, 8);
    // Data bytes
    for (let i = 0; i < bytes.length; i++) {
      writeBits(bytes[i], 8);
    }
    // Terminator: up to 4 zero bits
    const termLen = Math.min(4, dataCWCount * 8 - bitPos);
    writeBits(0, termLen);

    // Byte alignment
    while (bitPos % 8 !== 0) bitPos++;

    // Pad bytes
    const pad = [0xEC, 0x11];
    let padIdx = 0;
    while (bitPos < dataCWCount * 8) {
      writeBits(pad[padIdx % 2], 8);
      padIdx++;
    }

    // 2. Reed-Solomon EC Codewords
    const exp = new Uint8Array(512);
    const log = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      exp[i] = x;
      exp[i + 255] = x;
      log[x] = i;
      x = (x << 1) ^ (x & 128 ? 285 : 0);
    }

    // Generator polynomial for 26 EC codewords
    let g = new Uint8Array([1]);
    for (let i = 0; i < ecCWCount; i++) {
      const nextG = new Uint8Array(g.length + 1);
      for (let j = 0; j < g.length; j++) {
        nextG[j] ^= exp[log[g[j]] + i];
        nextG[j + 1] ^= g[j];
      }
      g = nextG;
    }

    const msg = new Uint8Array(dataCWCount + ecCWCount);
    msg.set(data);
    for (let i = 0; i < dataCWCount; i++) {
      const coef = msg[i];
      if (coef !== 0) {
        const logCoef = log[coef];
        for (let j = 0; j < g.length; j++) {
          msg[i + j] ^= exp[logCoef + log[g[j]]];
        }
      }
    }
    const ec = msg.slice(dataCWCount);

    // Combine Data + EC
    const allCW = new Uint8Array(dataCWCount + ecCWCount);
    allCW.set(data);
    allCW.set(ec, dataCWCount);

    // 3. Matrix Construction (37x37)
    const matrix = Array.from({ length: N }, () => new Int8Array(N).fill(-1));

    // Finder patterns
    const addFinder = (r, c) => {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
            if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) {
              const isBlack = (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
              matrix[nr][nc] = isBlack ? 1 : 0;
            } else {
              matrix[nr][nc] = 0;
            }
          }
        }
      }
    };

    addFinder(0, 0);
    addFinder(0, N - 7);
    addFinder(N - 7, 0);

    // Alignment pattern (for V5: row 30, col 30)
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const isBlack = (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0));
        matrix[30 + dr][30 + dc] = isBlack ? 1 : 0;
      }
    }

    // Timing patterns
    for (let i = 8; i < N - 8; i++) {
      if (matrix[6][i] === -1) matrix[6][i] = (i % 2 === 0) ? 1 : 0;
      if (matrix[i][6] === -1) matrix[i][6] = (i % 2 === 0) ? 1 : 0;
    }

    // Dark module
    matrix[N - 8][6] = 1;

    // Reserve Format Info areas
    for (let i = 0; i <= 8; i++) {
      if (matrix[6][i] === -1) matrix[6][i] = 0;
      if (matrix[i][6] === -1) matrix[i][6] = 0;
      if (matrix[8][i] === -1) matrix[8][i] = 0;
      if (matrix[i][8] === -1) matrix[i][8] = 0;
    }
    for (let i = 0; i < 8; i++) {
      if (matrix[N - 1 - i][8] === -1) matrix[N - 1 - i][8] = 0;
      if (matrix[8][N - 1 - i] === -1) matrix[8][N - 1 - i] = 0;
    }

    // Place Data bits
    let cwIdx = 0, bitIdxInCW = 7;
    let upward = true;

    for (let col = N - 1; col > 0; col -= 2) {
      if (col === 6) col = 5;

      const rows = [];
      if (upward) {
        for (let r = N - 1; r >= 0; r--) rows.push(r);
      } else {
        for (let r = 0; r < N; r++) rows.push(r);
      }

      for (let r of rows) {
        for (let c = col; c >= col - 1; c--) {
          if (matrix[r][c] === -1) {
            let bit = 0;
            if (cwIdx < allCW.length) {
              bit = (allCW[cwIdx] >> bitIdxInCW) & 1;
              bitIdxInCW--;
              if (bitIdxInCW < 0) {
                bitIdxInCW = 7;
                cwIdx++;
              }
            }
            const maskBit = ((r + c) % 2 === 0) ? 1 : 0;
            matrix[r][c] = bit ^ maskBit;
          }
        }
      }
      upward = !upward;
    }

    // Format Info bits for L level (01) + Mask 0 (000)
    const formatBits = [1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0];

    const formatCoords1 = [
      [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
      [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0]
    ];
    for (let i = 0; i < 15; i++) {
      const [r, c] = formatCoords1[i];
      matrix[r][c] = formatBits[i];
    }

    const formatCoords2 = [
      [8, N - 1], [8, N - 2], [8, N - 3], [8, N - 4], [8, N - 5], [8, N - 6], [8, N - 7],
      [N - 7, 8], [N - 6, 8], [N - 5, 8], [N - 4, 8], [N - 3, 8], [N - 2, 8], [N - 1, 8]
    ];
    for (let i = 0; i < 14; i++) {
      const [r, c] = formatCoords2[i];
      matrix[r][c] = formatBits[i < 7 ? i : i + 1];
    }

    // 4. Build SVG string
    const border = 2;
    const viewSize = N + border * 2;
    let pathD = '';

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (matrix[r][c] === 1) {
          pathD += `M${c + border},${r + border}h1v1h-1z `;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" width="220" height="220" role="img" aria-label="QR Code">
      <rect width="${viewSize}" height="${viewSize}" fill="#ffffff"/>
      <path d="${pathD.trim()}" fill="#0f172a"/>
    </svg>`;
  }
}
