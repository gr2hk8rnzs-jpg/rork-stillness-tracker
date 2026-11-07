//
//  GoalFieldView.swift
//  Stillness
//

import SwiftUI

/// Boxed numeric goal entry with a small pixel "GOAL" label. Tap anywhere on
/// the box to edit: the number is selected so typing replaces it, and Done
/// (or tapping away) saves it. Saved goals carry forward to following days.
struct GoalFieldView: View {
    let goal: Int
    let onCommit: (Int) -> Void

    @State private var draft: String = ""
    @State private var selection: TextSelection?
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 6) {
            Text("GOAL")
                .font(PixelFont.label(17))
                .tracking(2)
                .foregroundStyle(PixelTheme.ink)

            TextField("", text: $draft, selection: $selection)
                .font(PixelFont.display(26))
                .foregroundStyle(PixelTheme.ink)
                .multilineTextAlignment(.center)
                .keyboardType(.numberPad)
                .focused($isFocused)
                .tint(PixelTheme.blood)
                .frame(height: 54)
                .frame(maxWidth: .infinity)
                .background(isFocused ? PixelTheme.surface : PixelTheme.canvas)
                .pixelFrame(step: 5, lineWidth: 3)
                .overlay {
                    if isFocused {
                        PixelRect(step: 5)
                            .stroke(PixelTheme.blood, lineWidth: 3)
                            .allowsHitTesting(false)
                    }
                }
                .contentShape(Rectangle())
                .onTapGesture { isFocused = true }
                .onChange(of: draft) { _, newValue in
                    let digits = String(newValue.filter(\.isNumber).prefix(3))
                    if digits != newValue { draft = digits }
                }

            Text(isFocused ? "TYPE MINUTES" : "TAP TO EDIT")
                .font(PixelFont.labelRegular(12))
                .tracking(1)
                .foregroundStyle(PixelTheme.ink.opacity(0.6))
        }
        .onAppear { draft = String(goal) }
        .onChange(of: goal) { _, newValue in
            guard !isFocused else { return }
            draft = String(newValue)
        }
        .onChange(of: isFocused) { _, focused in
            if focused {
                // Select the current number so typing replaces it.
                selection = TextSelection(range: draft.startIndex..<draft.endIndex)
            } else {
                commit()
            }
        }
        .toolbar {
            if isFocused {
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button("Done") { isFocused = false }
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
        if clamped != goal { onCommit(clamped) }
    }
}

#Preview {
    GoalFieldView(goal: 60) { _ in }
        .padding()
        .background(PixelTheme.canvas)
}
