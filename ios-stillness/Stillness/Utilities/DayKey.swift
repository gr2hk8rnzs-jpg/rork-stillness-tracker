//
//  DayKey.swift
//  Stillness
//

import Foundation

/// Calendar-day identity helpers. Days are keyed as `yyyy-MM-dd` strings so
/// records stay stable across time zones and stored payloads read plainly.
nonisolated enum DayKey {
    private static let weekdayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

    /// Monday-first calendar used for the weekly streak grid.
    static var weekCalendar: Calendar {
        var calendar = Calendar.current
        calendar.firstWeekday = 2
        return calendar
    }

    static func key(for date: Date, calendar: Calendar = .current) -> String {
        let parts = calendar.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", parts.year ?? 0, parts.month ?? 0, parts.day ?? 0)
    }

    static func date(from key: String, calendar: Calendar = .current) -> Date? {
        let pieces = key.split(separator: "-").compactMap { Int($0) }
        guard pieces.count == 3 else { return nil }
        var parts = DateComponents()
        parts.year = pieces[0]
        parts.month = pieces[1]
        parts.day = pieces[2]
        return calendar.date(from: parts)
    }

    /// Short weekday initial, e.g. `M` for Monday.
    static func weekdayInitial(for date: Date, calendar: Calendar = .current) -> String {
        let index = calendar.component(.weekday, from: date) - 1
        let name = weekdayNames[max(0, min(6, index))]
        return String(name.prefix(1))
    }

    /// Row label in quest-log form, e.g. `MON 09/08`.
    static func rowLabel(for key: String, calendar: Calendar = .current) -> String {
        guard let date = date(from: key, calendar: calendar) else { return key }
        let index = calendar.component(.weekday, from: date) - 1
        let weekday = weekdayNames[max(0, min(6, index))]
        let month = calendar.component(.month, from: date)
        let day = calendar.component(.day, from: date)
        return String(format: "%@ %02d/%02d", weekday, month, day)
    }
}
