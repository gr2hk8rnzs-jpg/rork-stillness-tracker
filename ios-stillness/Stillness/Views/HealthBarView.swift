//
//  HealthBarView.swift
//  Stillness
//

import SwiftUI

/// RPG-style vertical health meter: black pixel border, white when empty,
/// red blocks stacking from the bottom as minutes accumulate.
struct HealthBarView: View {
    let progress: Double
    var segments: Int = StillnessRules.barSegments
    var borderWidth: CGFloat = PixelTheme.border
    var notch: CGFloat = PixelTheme.notch
    var dividerWidth: CGFloat = 3

    var body: some View {
        GeometryReader { geometry in
            let inner = geometry.size.height - borderWidth * 2
            let fillHeight = max(0, inner * min(1, max(0, progress)))
            ZStack(alignment: .bottom) {
                PixelTheme.canvas
                Rectangle()
                    .fill(PixelTheme.blood)
                    .frame(height: fillHeight)
                    .padding(.bottom, borderWidth)
                    .animation(.easeOut(duration: 0.18), value: fillHeight)
                segmentGrid(height: geometry.size.height)
            }
            .pixelFrame(step: notch, lineWidth: borderWidth)
        }
        .accessibilityHidden(true)
    }

    private func segmentGrid(height: CGFloat) -> some View {
        let usable = height - borderWidth * 2
        let rowHeight = usable / CGFloat(segments)
        return VStack(spacing: 0) {
            ForEach(1..<max(2, segments), id: \.self) { _ in
                Color.clear
                    .frame(height: rowHeight)
                    .overlay(alignment: .bottom) {
                        Rectangle()
                            .fill(PixelTheme.ink)
                            .frame(height: dividerWidth)
                    }
            }
            Color.clear.frame(height: rowHeight)
        }
        .padding(.vertical, borderWidth)
    }
}

#Preview {
    HStack(spacing: 20) {
        HealthBarView(progress: 0.5)
            .frame(width: 120, height: 420)
        HealthBarView(progress: 1.0, segments: 8, borderWidth: 3, notch: 4, dividerWidth: 2)
            .frame(width: 40, height: 120)
    }
    .padding()
    .background(PixelTheme.canvas)
}
