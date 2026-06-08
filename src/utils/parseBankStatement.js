/**
 * Parse CSV bank exports. Expected headers (flexible):
 * amount, type, category, date — or description, debit, credit
 */
export function parseBankStatementFile(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return parseJsonImport(trimmed);
  }

  return parseCsvImport(trimmed);
}

function parseJsonImport(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.transactions;
  if (!Array.isArray(list)) return [];

  return list
    .map((row, i) => normalizeRow(row, i))
    .filter((r) => r && r.amount > 0);
}

function parseCsvImport(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (!cols.length) continue;

    const get = (name) => {
      const idx = header.indexOf(name);
      return idx >= 0 ? cols[idx]?.trim() : "";
    };

    const debit = parseFloat(get("debit") || get("withdrawal") || "");
    const credit = parseFloat(get("credit") || get("deposit") || "");
    let amount = parseFloat(get("amount") || get("value") || "");
    let type = (get("type") || "").toLowerCase();

    if (!Number.isNaN(credit) && credit > 0) {
      amount = credit;
      type = "income";
    } else if (!Number.isNaN(debit) && debit > 0) {
      amount = debit;
      type = "expense";
    }

    if (Number.isNaN(amount) || amount <= 0) continue;

    if (type !== "income" && type !== "expense") {
      type = amount < 0 ? "expense" : "expense";
      amount = Math.abs(amount);
    }

    const category = get("category") || get("description") || get("narration") || "Import";
    const dateRaw = get("date") || get("transaction date");
    let date = new Date().toISOString();
    if (dateRaw) {
      const parsed = new Date(dateRaw);
      if (!Number.isNaN(parsed.getTime())) date = parsed.toISOString();
    }

    rows.push({
      id: Date.now() + i,
      amount: Math.abs(amount),
      type,
      category,
      date,
    });
  }

  return rows;
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
}

function normalizeRow(row, index) {
  if (!row || typeof row !== "object") return null;
  const amount = parseFloat(row.amount);
  if (Number.isNaN(amount) || amount <= 0) return null;

  const type = row.type === "income" ? "income" : "expense";
  return {
    id: row.id || Date.now() + index,
    amount,
    type,
    category: (row.category || "Import").trim() || "Import",
    date: row.date || new Date().toISOString(),
  };
}
