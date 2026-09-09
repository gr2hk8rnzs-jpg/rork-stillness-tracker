//
//  StreakView.swift
//  Stillness
//

import SwiftUI

/// Arcade stats screen: current streak plus a Monday-first weekly bar chart.
struct StreakView: View {
    @Environment(StillnessStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 12) {
            PixelOutlineText(text: "STREAK", font: PixelFont.display(38))
                .minimumScaleFactor(0.5)
                .lineLimit(1)

            VStack(spacing: 2) {
                PixelOutlineText(
                    text: "\(store.streak)",
                    font: PixelFont.display(74),
                    fill: PixelTheme.blood,
                    thickness: 3
                )
                Text("DAY STREAK")
                    .font(PixelFont.label(19))
                    .tracking(3)
                    .foregroundStyle(PixelTheme.ink)
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Current streak")
            .accessibilityValue("\(store.streak) days")

            weekChart

            statsRow

            PixelButton(title: "BACK") { dismiss() }
        }
        .padding(.horizontal, 16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(PixelTheme.canvas)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var weekChart: some View {
        HStack(alignment: .bottom, spacing: 8) {
            ForEach(store.currentWeek) { record in
                VStack(spacing: 6) {
                    HealthBarView(
                        progress: record.progress,
                        segments: 8,
                        borderWidth: 3,
                        notch: 4,
                        dividerWidth: 2
                    )
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

                    Text(weekdayInitial(for: record))
                        .font(PixelFont.display(15))
                        .foregroundStyle(
                            record.dateKey == store.todayKey ? PixelTheme.blood : PixelTheme.ink
                        )
                }
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(DayKey.rowLabel(for: record.dateKey))
                .accessibilityValue("\(record.minutes) of \(record.goal) minutes")
            }
        }
        .padding(12)
        .frame(maxHeight: .infinity)
        .background(PixelTheme.canvas)
        .pixelFrame()
    }

    private var statsRow: some View {
        HStack(spacing: 12) {
            statTile(value: "\(store.bestStreak)", label: "BEST RUN")
            statTile(value: "\(store.totalMinutes)", label: "TOTAL MIN")
        }
    }

    private func statTile(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(PixelFont.display(24))
                .foregroundStyle(PixelTheme.blood)
                .lineLimit(1)
                .minimumScaleFactor(0.5)
            Text(label)
                .font(PixelFont.label(15))
                .tracking(2)
                .foregroundStyle(PixelTheme.ink)
        }
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity)
        .background(PixelTheme.surface)
        .pixelFrame(step: 5, lineWidth: 3)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label)
        .accessibilityValue(value)
    }

    private func weekdayInitial(for record: DayRecord) -> String {
        guard let date = DayKey.date(from: record.dateKey, calendar: DayKey.weekCalendar) else {
            return "?"
        }
        return DayKey.weekdayInitial(for: date, calendar: DayKey.weekCalendar)
    }
}

#Preview {
    NavigationStack {
        StreakView()
    }
    .environment(StillnessStore())
}
