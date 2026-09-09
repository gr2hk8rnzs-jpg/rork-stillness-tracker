//
//  DayRecord.swift
//  Stillness
//

import Foundation

/// One calendar day of meditation: minutes logged against that day's goal.
nonisolated struct DayRecord: Codable, Identifiable, Hashable {
    /// `yyyy-MM-dd` calendar-day key.
    let dateKey: String
    /// Minutes meditated on this day.
    var minutes: Int
    /// Goal in minutes that applied to this day.
    var goal: Int
    /// How many times the day was explicitly logged.
    var sessions: Int

    var id: String { dateKey }

    var isComplete: Bool { goal > 0 && minutes >= goal }

    /// Completion ratio clamped to `0...1`.
    var progress: Double {
        guard goal > 0 else { return 0 }
        return min(1, max(0, Double(minutes) / Double(goal)))
    }

    init(dateKey: String, minutes: Int = 0, goal: Int, sessions: Int = 0) {
        self.dateKey = dateKey
        self.minutes = minutes
        self.goal = goal
        self.sessions = sessions
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        dateKey = try container.decode(String.self, forKey: .dateKey)
        minutes = try container.decodeIfPresent(Int.self, forKey: .minutes) ?? 0
        goal = try container.decodeIfPresent(Int.self, forKey: .goal) ?? StillnessRules.defaultGoal
        sessions = try container.decodeIfPresent(Int.self, forKey: .sessions) ?? 0
    }
}

/// Shared tuning constants for goals and slider stepping.
nonisolated enum StillnessRules {
    static let defaultGoal = 60
    static let minGoal = 5
    static let maxGoal = 600
    /// Slider granularity in minutes.
    static let step = 5
    /// Segment count of the big health bar.
    static let barSegments = 12
}
