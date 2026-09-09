//
//  TrackerView.swift
//  Stillness
//

import SwiftUI

/// Root screen: health bar on the left, minute slider, numeric readout and
/// carry-forward goal field on the right, log action along the bottom.
struct TrackerView: View {
    @Environment(StillnessStore.self) private var store

    @State private var isCelebrating: Bool = false
    @State private var justLogged: Bool = false
    @State private var dismissTask: Task<Void, Never>?

    private var record: DayRecord { store.today }

    var body: some View {
        VStack(spacing: 14) {
            PixelOutlineText(text: "STILLNESS", font: PixelFont.display(38))
                .minimumScaleFactor(0.4)
                .lineLimit(1)
                .padding(.horizontal, 4)

            HStack(alignment: .top, spacing: 18) {
                HealthBarView(progress: record.progress)
                    .frame(maxWidth: 132, maxHeight: .infinity)

                VStack(spacing: 10) {
                    readout
                    MinuteSliderView(
                        minutes: record.minutes,
                        goal: record.goal,
                        onChange: updateMinutes
                    )
                    .frame(maxHeight: .infinity)

                    GoalFieldView(goal: record.goal) { newGoal in
                        store.setGoal(newGoal)
                        Haptics.tap()
                    }
                }
                .frame(maxWidth: .infinity)
            }
            .frame(maxHeight: .infinity)

            PixelButton(title: justLogged ? "SAVED!" : "LOG SESSION", isEnabled: record.minutes > 0) {
                logSession()
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 4)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(PixelTheme.canvas)
        .overlay {
            if isCelebrating {
                CelebrationOverlay(onClose: endCelebration)
                    .transition(.opacity)
                    .allowsHitTesting(true)
            }
        }
        .animation(.easeOut(duration: 0.2), value: isCelebrating)
        .contentShape(Rectangle())
        .onChange(of: record.isComplete) { wasComplete, isComplete in
            if isComplete, !wasComplete {
                startCelebration()
            }
        }
        .onDisappear {
            dismissTask?.cancel()
        }
    }

    private var readout: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                PixelOutlineText(
                    text: "\(record.minutes)",
                    font: PixelFont.display(42),
                    fill: PixelTheme.blood,
                    thickness: 2
                )
                PixelOutlineText(
                    text: "/\(record.goal)",
                    font: PixelFont.display(42),
                    fill: PixelTheme.ink,
                    outline: PixelTheme.ink,
                    thickness: 0
                )
            }
            .minimumScaleFactor(0.4)
            .lineLimit(1)

            Text("MIN")
                .font(PixelFont.label(19))
                .tracking(3)
                .foregroundStyle(PixelTheme.ink)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Today's progress")
        .accessibilityValue("\(record.minutes) of \(record.goal) minutes")
    }

    private func updateMinutes(_ minutes: Int) {
        guard minutes != record.minutes else { return }
        store.setMinutes(minutes)
        Haptics.step()
        if justLogged {
            justLogged = false
        }
    }

    private func logSession() {
        store.logSession()
        Haptics.tap()
        justLogged = true
        if record.isComplete {
            startCelebration()
        }
        Task {
            try? await Task.sleep(for: .seconds(1.6))
            justLogged = false
        }
    }

    private func startCelebration() {
        dismissTask?.cancel()
        isCelebrating = true
        Haptics.victory()
        dismissTask = Task {
            try? await Task.sleep(for: .seconds(10))
            guard !Task.isCancelled else { return }
            isCelebrating = false
        }
    }

    private func endCelebration() {
        dismissTask?.cancel()
        isCelebrating = false
    }
}

#Preview {
    NavigationStack {
        TrackerView()
    }
    .environment(StillnessStore())
}
