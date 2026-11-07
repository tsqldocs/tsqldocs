// SQL Server's data type precedence order, highest to lowest, exactly as
// published at https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-type-precedence-transact-sql
// (verified against the current page, not transcribed from memory — this
// list has changed over time, e.g. `json` and `vector` are both recent
// additions). When two expressions of different types meet in a
// comparison, join, or other operator, the LOWER-precedence type is
// implicitly converted to the HIGHER-precedence type.
//
// Length/precision/scale (varchar(50) vs varchar(200)) never affects
// precedence — only the base type does — so this list intentionally
// doesn't distinguish sized variants.
export const TYPE_PRECEDENCE: string[] = [
  'json',
  'sql_variant',
  'xml',
  'user-defined type',
  'datetimeoffset',
  'datetime2',
  'datetime',
  'smalldatetime',
  'date',
  'time',
  'float',
  'real',
  'decimal',
  'money',
  'smallmoney',
  'bigint',
  'int',
  'smallint',
  'tinyint',
  'bit',
  'ntext',
  'text',
  'image',
  'timestamp',
  'uniqueidentifier',
  'nvarchar',
  'nchar',
  'varchar',
  'char',
  'vector',
  'varbinary',
  'binary',
];

// Microsoft documents these three as ranking above the string/binary
// types but doesn't give them an exact numeric position in the main
// list — so they're tracked separately rather than guessed into a rank.
export const UNRANKED_HIGHER_THAN_STRING = ['hierarchyid', 'geometry', 'geography'];

export const ALL_TYPES = [...TYPE_PRECEDENCE, ...UNRANKED_HIGHER_THAN_STRING];

const STRING_TYPES = new Set(['nvarchar', 'nchar', 'varchar', 'char']);
const BINARY_TYPES = new Set(['varbinary', 'binary']);

export type ComparisonResult =
  | { kind: 'ranked'; winner: string; loser: string; winnerRank: number; loserRank: number }
  | { kind: 'same' }
  | { kind: 'unranked-vs-string'; winner: string; loser: string }
  | { kind: 'unranked-vs-unranked' };

export function compareTypes(a: string, b: string): ComparisonResult {
  if (a === b) return { kind: 'same' };

  const aUnranked = UNRANKED_HIGHER_THAN_STRING.includes(a);
  const bUnranked = UNRANKED_HIGHER_THAN_STRING.includes(b);

  if (aUnranked && bUnranked) return { kind: 'unranked-vs-unranked' };
  if (aUnranked) {
    if (STRING_TYPES.has(b) || BINARY_TYPES.has(b)) {
      return { kind: 'unranked-vs-string', winner: a, loser: b };
    }
    // Microsoft doesn't publish where these three rank among the numeric/
    // date types either — only that they beat string/binary specifically.
    return { kind: 'unranked-vs-unranked' };
  }
  if (bUnranked) {
    if (STRING_TYPES.has(a) || BINARY_TYPES.has(a)) {
      return { kind: 'unranked-vs-string', winner: b, loser: a };
    }
    return { kind: 'unranked-vs-unranked' };
  }

  const rankA = TYPE_PRECEDENCE.indexOf(a);
  const rankB = TYPE_PRECEDENCE.indexOf(b);
  const winner = rankA < rankB ? a : b;
  const loser = rankA < rankB ? b : a;
  return {
    kind: 'ranked',
    winner,
    loser,
    winnerRank: Math.min(rankA, rankB) + 1,
    loserRank: Math.max(rankA, rankB) + 1,
  };
}

// The specific, high-impact case this whole tool exists to catch: an
// NVARCHAR parameter (ADO.NET's default for a .NET string) compared
// against a VARCHAR column forces the column to convert, which can
// defeat an index on it — see /blog/implicit-conversion-kills-index.
export function isIndexKillingStringMismatch(a: string, b: string): boolean {
  const aIsString = STRING_TYPES.has(a);
  const bIsString = STRING_TYPES.has(b);
  return aIsString && bIsString && a !== b;
}
