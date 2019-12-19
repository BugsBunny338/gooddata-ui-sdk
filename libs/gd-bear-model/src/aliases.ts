// (C) 2007-2019 GoodData Corporation
// Type aliases, because string is too vague to represent some values

/**
 * @public
 */
export type Timestamp = string; // YYYY-MM-DD HH:mm:ss

/**
 * @public
 */
export type DateString = string; // YYYY-MM-DD

/**
 * @public
 */
export type TimeIso8601 = string; // YYYY-MM-DDTHH:mm:ss.sssZ

/**
 * @public
 */
export type Email = string; // xxx@xxx.xx

/**
 * @public
 */
export type NumberAsString = string; // Number, but returned as a string

/**
 * @public
 */
export type Uri = string; // Metadata uri (f.e. /gdc/md/...)

/**
 * @public
 */
export type MaqlExpression = string; // Maql expression (f.e. SELECT [/gdc/md/...] IN [/gdc/md/...])

/**
 * @public
 */
export type BooleanAsString = "1" | "0";
