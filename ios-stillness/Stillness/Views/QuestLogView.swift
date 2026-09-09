//
//  QuestLogView.swift
//  Stillness
//

import SwiftUI

/// History of past days, framed as an RPG quest log.
struct QuestLogView: View {
    @Environment(StillnessStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 14) {
            PixelOutlineText(text: "QUEST LOG", font: PixelFont.display(34))
                .minimumScaleFactor(0.5)
                .lineLimit(1)

            if store.history.isEmpty {
                emptyState
            } else {
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(store.history) { record in
                            row(for: record)
                        }
                    }
                    .padding(.horizontal, 4)
                    .padding(.vertical, 6)
                }
                .scrollIndicators(.hidden)
            }

            PixelButton(title: "BACK") { dismiss() }
        }
        .padding(.horizontal, 16)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(PixelTheme.canvas)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func row(for record: DayRecord) -> some View {
        HStack(spacing: 14) {
            HealthBarView(
                progress: record.progress,
                segments: 6,
                borderWidth: 3,
                notch: 4,
                dividerWidth: 2
            )
            .frame(width: 30, height: 74)

            VStack(alignment: .leading, spacing: 4) {
                Text(DayKey.rowLabel(for: record.dateKey))
                    .font(PixelFont.display(17))
                    .foregroundStyle(PixelTheme.ink)
                HStack(spacing: 0) {
                    Text("\(record.minutes)")
                        .font(PixelFont.display(24))
                        .foregroundStyle(PixelTheme.blood)
                    Text("/\(record.goal)")
                        .font(PixelFont.display(24))
                        .foregroundStyle(PixelTheme.ink)
                }
            }

            Spacer(minLength: 0)

            if record.isComplete {
                Image(systemName: "star.fill")
                    .font(.system(size: 30))
                    .foregroundStyle(PixelTheme.flame)
                    .accessibilityHidden(true)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity)
        .background(record.dateKey == store.todayKey ? PixelTheme.surface : PixelTheme.canvas)
        .pixelFrame(step: 6, lineWidth: 4)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(DayKey.rowLabel(for: record.dateKey))
        .accessibilityValue(
            record.isComplete
                ? "Goal cleared, \(record.minutes) of \(record.goal) minutes"
                : "\(record.minutes) of \(record.goal) minutes"
        )
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            PixelStar(color: PixelTheme.steel)
                .frame(width: 54, height: 54)
            Text("NO QUESTS YET")
                .font(PixelFont.display(18))
                .foregroundStyle(PixelTheme.ink)
            Text("LOG SOME STILLNESS\nTO FILL THIS SCROLL")
                .font(PixelFont.label(16))
                .tracking(1)
                .multilineTextAlignment(.center)
                .foregroundStyle(PixelTheme.ink.opacity(0.6))
        }
        .frame(maxHeight: .infinity)
    }
}

#Preview {
    NavigationStack {
        QuestLogView()
    }
    .environment(StillnessStore())
}
