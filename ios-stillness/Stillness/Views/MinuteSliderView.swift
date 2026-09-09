//
//  MinuteSliderView.swift
//  Stillness
//

import SwiftUI

/// Vertical pixel slider that drives today's minutes. Drag the metal grip up
/// to fill the health bar, down to empty it. Snaps to five-minute steps.
struct MinuteSliderView: View {
    let minutes: Int
    let goal: Int
    let onChange: (Int) -> Void

    private let handleHeight: CGFloat = 38
    private let handleWidth: CGFloat = 62
    private let trackWidth: CGFloat = 22

    private var fraction: Double {
        guard goal > 0 else { return 0 }
        return min(1, max(0, Double(minutes) / Double(goal)))
    }

    var body: some View {
        GeometryReader { geometry in
            let height = geometry.size.height
            let usable = max(1, height - handleHeight)
            let handleTop = usable * (1 - fraction)
            let handleCenter = handleTop + handleHeight / 2

            ZStack(alignment: .top) {
                Color.clear
                    .overlay(alignment: .leading) {
                        tickColumn
                            .padding(.vertical, handleHeight / 2)
                    }
                    .overlay {
                        track(height: height, fillHeight: height - handleCenter)
                            .padding(.leading, 26)
                    }
                    .overlay(alignment: .top) {
                        grip
                            .padding(.leading, 26)
                            .offset(y: handleTop)
                    }
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        let clampedY = min(max(value.location.y, handleHeight / 2), height - handleHeight / 2)
                        let ratio = 1 - Double((clampedY - handleHeight / 2) / usable)
                        onChange(snap(ratio * Double(goal)))
                    }
            )
            .animation(.easeOut(duration: 0.12), value: fraction)
        }
        .frame(width: handleWidth + 26)
        .accessibilityElement()
        .accessibilityLabel("Minutes meditated today")
        .accessibilityValue("\(minutes) of \(goal) minutes")
        .accessibilityAdjustableAction { direction in
            switch direction {
            case .increment:
                onChange(min(goal, minutes + StillnessRules.step))
            case .decrement:
                onChange(max(0, minutes - StillnessRules.step))
            @unknown default:
                break
            }
        }
    }

    private func snap(_ raw: Double) -> Int {
        let step = Double(StillnessRules.step)
        let snapped = Int((raw / step).rounded()) * StillnessRules.step
        return min(goal, max(0, snapped))
    }

    private func track(height: CGFloat, fillHeight: CGFloat) -> some View {
        ZStack(alignment: .bottom) {
            PixelTheme.canvas
            Rectangle()
                .fill(PixelTheme.blood)
                .frame(height: max(0, fillHeight - 3))
        }
        .frame(width: trackWidth)
        .pixelFrame(step: 4, lineWidth: 3)
    }

    private var tickColumn: some View {
        VStack(spacing: 0) {
            ForEach(0..<13, id: \.self) { index in
                Rectangle()
                    .fill(PixelTheme.ink)
                    .frame(width: index % 3 == 0 ? 18 : 11, height: 3)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                if index < 12 {
                    Spacer(minLength: 0)
                }
            }
        }
        .frame(width: 20)
    }

    private var grip: some View {
        ZStack {
            PixelTheme.steel
            VStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { _ in
                    Rectangle()
                        .fill(PixelTheme.ink)
                        .frame(width: 26, height: 3)
                }
            }
        }
        .frame(width: handleWidth, height: handleHeight)
        .pixelFrame(step: 5, lineWidth: 3)
    }
}

#Preview {
    MinuteSliderView(minutes: 30, goal: 60) { _ in }
        .frame(height: 380)
        .padding()
        .background(PixelTheme.canvas)
}
