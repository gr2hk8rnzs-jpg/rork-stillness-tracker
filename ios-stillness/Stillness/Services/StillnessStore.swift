//
//  StillnessStore.swift
//  Stillness
//

import Foundation
import Observation

/// Persistent source of truth for daily meditation minutes and goals.
///
/// Goals carry forward: whenever the goal is changed on a day, that value
/// becomes the default for every later day until it is changed again.
@Observable
final class StillnessStore {
    private static let recordsKey = "stillness.records.v1"
    private static let carriedGoalKey = "stillness.carriedGoal.v1"

    private let defaults: UserDefaults

    /// All known days keyed by `yyyy-MM-dd`.
    private(set) var records: [String: DayRecord] = [:]
    /// Goal inherited by any newly created day.
    private(set) var carriedGoal: Int = StillnessRules.defaultGoal
    /// Key of the day currently being tracked.
    private(set) var todayKey: String = DayKey.key(for: Date())

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        load()
        refreshToday()
    }

    // MARK: - Today

    var today: DayRecord {
        records[todayKey] ?? DayRecord(dateKey: todayKey, goal: carriedGoal)
    }

    /// Creates today's record if needed and handles day rollover.
    func refreshToday() {
        let key = DayKey.key(for: Date())
        todayKey = key
        if records[key] == nil {
            records[key] = DayRecord(dateKey: key, goal: carriedGoal)
            persist()
        }
    }

    /// Sets today's logged minutes, clamped to `0...goal`.
    func setMinutes(_ minutes: Int) {
        var record = today
        let clamped = max(0, min(record.goal, minutes))
        guard clamped != record.minutes else { return }
        record.minutes = clamped
        records[record.dateKey] = record
        persist()
    }

    /// Sets today's goal and carries it forward to future days.
    func setGoal(_ goal: Int) {
        let clamped = max(StillnessRules.minGoal, min(StillnessRules.maxGoal, goal))
        var record = today
        carriedGoal = clamped
        guard record.goal != clamped else {
            persist()
            return
        }
        record.goal = clamped
        record.minutes = min(record.minutes, clamped)
        records[record.dateKey] = record
        persist()
    }

    /// Marks an explicit "log session" tap for today.
    func logSession() {
        var record = today
        record.sessions += 1
        records[record.dateKey] = record
        persist()
    }

    // MARK: - Derived data

    /// Recorded days, newest first.
    var history: [DayRecord] {
        records.values.sorted { $0.dateKey > $1.dateKey }
    }

    /// Consecutive completed days ending today (or yesterday if today is open).
    var streak: Int {
        let calendar = Calendar.current
        var count = 0
        var cursor = Date()
        if let todayRecord = records[todayKey], !todayRecord.isComplete {
            guard let yesterday = calendar.date(byAdding: .day, value: -1, to: cursor) else { return 0 }
            cursor = yesterday
        }
        while let record = records[DayKey.key(for: cursor, calendar: calendar)], record.isComplete {
            count += 1
            guard let previous = calendar.date(byAdding: .day, value: -1, to: cursor) else { break }
            cursor = previous
        }
        return count
    }

    /// Longest completed run ever recorded.
    var bestStreak: Int {
        let calendar = Calendar.current
        let completed = Set(records.values.filter(\.isComplete).map(\.dateKey))
        var best = 0
        for key in completed {
            guard let date = DayKey.date(from: key, calendar: calendar) else { continue }
            let previousKey = calendar.date(byAdding: .day, value: -1, to: date).map {
                DayKey.key(for: $0, calendar: calendar)
            }
            // Only walk forward from the start of a run.
            if let previousKey, completed.contains(previousKey) { continue }
            var run = 0
            var cursor: Date? = date
            while let current = cursor, completed.contains(DayKey.key(for: current, calendar: calendar)) {
                run += 1
                cursor = calendar.date(byAdding: .day, value: 1, to: current)
            }
            best = max(best, run)
        }
        return best
    }

    /// Total minutes ever logged.
    var totalMinutes: Int {
        records.values.reduce(0) { $0 + $1.minutes }
    }

    /// Monday-first current week, always seven entries.
    var currentWeek: [DayRecord] {
        let calendar = DayKey.weekCalendar
        guard let start = calendar.dateInterval(of: .weekOfYear, for: Date())?.start else { return [] }
        return (0..<7).compactMap { offset in
            guard let date = calendar.date(byAdding: .day, value: offset, to: start) else { return nil }
            let key = DayKey.key(for: date, calendar: calendar)
            return records[key] ?? DayRecord(dateKey: key, goal: carriedGoal)
        }
    }

    // MARK: - Persistence

    private func load() {
        carriedGoal = defaults.object(forKey: Self.carriedGoalKey) as? Int ?? StillnessRules.defaultGoal
        guard let data = defaults.data(forKey: Self.recordsKey) else { return }
        do {
            let stored = try JSONDecoder().decode([DayRecord].self, from: data)
            records = Dictionary(uniqueKeysWithValues: stored.map { ($0.dateKey, $0) })
        } catch {
            print("StillnessStore: could not read saved days, starting fresh")
            records = [:]
        }
    }

    private func persist() {
        defaults.set(carriedGoal, forKey: Self.carriedGoalKey)
        do {
            let data = try JSONEncoder().encode(Array(records.values))
            defaults.set(data, forKey: Self.recordsKey)
        } catch {
            print("StillnessStore: could not save days")
        }
    }
}
