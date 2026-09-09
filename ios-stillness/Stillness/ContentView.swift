//
//  ContentView.swift
//  Stillness
//

import SwiftUI

/// Navigation destinations reachable from the tracker.
enum StillnessRoute: Hashable {
    case questLog
    case streak
}

/// Root shell: the tracker plus pixel-chip navigation to the log and streak.
struct ContentView: View {
    @Environment(StillnessStore.self) private var store
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        NavigationStack {
            TrackerView()
                .navigationTitle("")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarLeading) {
                        NavigationLink(value: StillnessRoute.questLog) {
                            PixelChipLabel(title: "QUEST LOG")
                        }
                        .accessibilityLabel("Open quest log")
                    }
                    ToolbarItem(placement: .topBarTrailing) {
                        NavigationLink(value: StillnessRoute.streak) {
                            PixelChipLabel(title: "STREAK")
                        }
                        .accessibilityLabel("Open streak")
                    }
                }
                .navigationDestination(for: StillnessRoute.self) { route in
                    switch route {
                    case .questLog:
                        QuestLogView()
                    case .streak:
                        StreakView()
                    }
                }
        }
        .tint(PixelTheme.ink)
        .onChange(of: scenePhase) { _, phase in
            if phase == .active {
                store.refreshToday()
            }
        }
    }
}

#Preview {
    ContentView()
        .environment(StillnessStore())
}
