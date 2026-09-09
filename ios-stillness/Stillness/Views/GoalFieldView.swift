//
//  GoalFieldView.swift
//  Stillness
//

import SwiftUI

/// Boxed numeric goal entry with a small pixel "GOAL" label.
/// Committed values carry forward to every following day.
struct GoalFieldView: View {
    let goal: Int
    let onCommit: (Int) -> Void

    @State private var draft: String = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 6) {
            Text("GOAL")
                .font(PixelFont.label(17))
                .tracking(2)
                .foregroundStyle(PixelTheme.ink)

            TextField("", text: $draft)
                .font(PixelFont.display(28))
                .foregroundStyle(PixelTheme.ink)
                .multilineTextAlignment(.center)
                .keyboardType(.numberPad)
                .focused($isFocused)
                .tint(PixelTheme.blood)
                .frame(height: 54)
                .frame(maxWidth: .infinity)
                .background(PixelTheme.canvas)
                .pixelFrame(step: 5, lineWidth: 3)
        }
        .onAppear { draft = String(goal) }
        .onChange(of: goal) { _, newValue in
            guard !isFocused else { return }
            draft = String(newValue)
        }
        .onChange(of: isFocused) { _, focused in
            if focused {
                draft = ""
            } else {
                commit()
            }
        }
        .toolbar {
            if isFocused {
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button("Set goal") { isFocused = false }
                        .font(PixelFont.label(16))
                        .foregroundStyle(PixelTheme.blood)
                }
            }
        }
        .accessibilityLabel("Daily goal in minutes")
    }

    private func commit() {
        guard let parsed = Int(draft.filter(\.isNumber)) else {
            draft = String(goal)
            return
        }
        let clamped = max(StillnessRules.minGoal, min(StillnessRules.maxGoal, parsed))
        draft = String(clamped)
        onCommit(clamped)
    }
}

#Preview {
    GoalFieldView(goal: 60) { _ in }
        .padding()
        .background(PixelTheme.canvas)
}
