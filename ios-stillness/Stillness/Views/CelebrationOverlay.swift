//
//  CelebrationOverlay.swift
//  Stillness
//

import SwiftUI

/// Victory flourish shown for ten seconds when the daily goal is cleared:
/// pixel sparkles burst around the health bar and a multicolour arcade
/// "YOU DID IT!" plaque flashes over the meter.
struct CelebrationOverlay: View {
    let onClose: () -> Void

    @State private var isTwinkling: Bool = false
    @State private var isPopped: Bool = false

    private struct Sparkle: Identifiable {
        let id: Int
        let x: Double
        let y: Double
        let size: CGFloat
        let color: Color
        let delay: Double
        let duration: Double
    }

    private var sparkles: [Sparkle] {
        let palette: [Color] = [PixelTheme.gold, PixelTheme.flame, PixelTheme.blood]
        let spots: [(Double, Double, CGFloat)] = [
            (0.09, 0.16, 26), (0.20, 0.09, 16), (0.05, 0.30, 30), (0.46, 0.13, 18),
            (0.86, 0.20, 26), (0.94, 0.35, 18), (0.79, 0.06, 16), (0.10, 0.48, 22),
            (0.44, 0.62, 24), (0.90, 0.55, 28), (0.13, 0.68, 18), (0.47, 0.78, 22),
            (0.06, 0.83, 30), (0.90, 0.74, 20), (0.16, 0.92, 18), (0.83, 0.90, 24),
        ]
        return spots.enumerated().map { index, spot in
            Sparkle(
                id: index,
                x: spot.0,
                y: spot.1,
                size: spot.2,
                color: palette[index % palette.count],
                delay: Double(index) * 0.07,
                duration: 0.5 + Double(index % 3) * 0.18
            )
        }
    }

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                ForEach(sparkles) { sparkle in
                    PixelStar(color: sparkle.color)
                        .frame(width: sparkle.size, height: sparkle.size)
                        .scaleEffect(isTwinkling ? 1 : 0.15)
                        .opacity(isTwinkling ? 1 : 0.15)
                        .animation(
                            .easeInOut(duration: sparkle.duration)
                                .repeatForever()
                                .delay(sparkle.delay),
                            value: isTwinkling
                        )
                        .position(
                            x: sparkle.x * geometry.size.width,
                            y: sparkle.y * geometry.size.height
                        )
                }

                banner
                    .position(x: geometry.size.width / 2, y: geometry.size.height * 0.44)
            }
            .overlay(alignment: .topLeading) {
                closeButton
            }
        }
        .onAppear {
            isTwinkling = true
            withAnimation(.spring(response: 0.45, dampingFraction: 0.5)) {
                isPopped = true
            }
        }
    }

    private var banner: some View {
        VStack(spacing: -6) {
            plaque(letters: "YOU", size: 44)
                .rotationEffect(.degrees(-3))
            plaque(letters: "DID IT!", size: 44)
                .rotationEffect(.degrees(2))
        }
        .scaleEffect(isPopped ? 1 : 0.3)
        .opacity(isPopped ? 1 : 0)
        .phaseAnimator([false, true]) { content, phase in
            content
                .scaleEffect(phase ? 1.05 : 0.97)
        } animation: { _ in
            .easeInOut(duration: 0.42)
        }
        .accessibilityElement()
        .accessibilityLabel("You did it! Daily goal complete.")
        .accessibilityAddTraits(.isHeader)
    }

    private func plaque(letters: String, size: CGFloat) -> some View {
        HStack(spacing: 0) {
            ForEach(Array(letters.enumerated()), id: \.offset) { index, character in
                if character == " " {
                    Spacer().frame(width: size * 0.4)
                } else {
                    PixelOutlineText(
                        text: String(character),
                        font: PixelFont.display(size),
                        fill: letterColor(index),
                        outline: PixelTheme.ink,
                        thickness: 2
                    )
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(PixelTheme.canvas)
        .pixelFrame(step: 6, lineWidth: 4)
    }

    private func letterColor(_ index: Int) -> Color {
        switch index % 3 {
        case 0: return PixelTheme.flame
        case 1: return PixelTheme.blood
        default: return PixelTheme.ink
        }
    }

    private var closeButton: some View {
        Button(action: onClose) {
            Image(systemName: "xmark")
                .font(.system(size: 17, weight: .black))
                .foregroundStyle(PixelTheme.ink)
                .frame(width: 40, height: 40)
                .background(PixelTheme.canvas)
                .pixelFrame(step: 5, lineWidth: 3)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Dismiss celebration")
    }
}

#Preview {
    CelebrationOverlay {}
        .background(PixelTheme.canvas)
}
