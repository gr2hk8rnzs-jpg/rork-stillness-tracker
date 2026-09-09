//
//  PixelRect.swift
//  Stillness
//

import SwiftUI

/// A rectangle whose corner pixels are cut away, mimicking the stepped
/// "rounded" corners of early-90s console interfaces. Hard edges only.
nonisolated struct PixelRect: Shape, InsettableShape {
    var step: CGFloat = PixelTheme.notch
    var insetAmount: CGFloat = 0

    func path(in rect: CGRect) -> Path {
        let r = rect.insetBy(dx: insetAmount, dy: insetAmount)
        guard r.width > 0, r.height > 0 else { return Path() }
        let s = min(step, min(r.width, r.height) / 3)
        var path = Path()
        path.move(to: CGPoint(x: r.minX + s, y: r.minY))
        path.addLine(to: CGPoint(x: r.maxX - s, y: r.minY))
        path.addLine(to: CGPoint(x: r.maxX - s, y: r.minY + s))
        path.addLine(to: CGPoint(x: r.maxX, y: r.minY + s))
        path.addLine(to: CGPoint(x: r.maxX, y: r.maxY - s))
        path.addLine(to: CGPoint(x: r.maxX - s, y: r.maxY - s))
        path.addLine(to: CGPoint(x: r.maxX - s, y: r.maxY))
        path.addLine(to: CGPoint(x: r.minX + s, y: r.maxY))
        path.addLine(to: CGPoint(x: r.minX + s, y: r.maxY - s))
        path.addLine(to: CGPoint(x: r.minX, y: r.maxY - s))
        path.addLine(to: CGPoint(x: r.minX, y: r.minY + s))
        path.addLine(to: CGPoint(x: r.minX + s, y: r.minY + s))
        path.closeSubpath()
        return path
    }

    func inset(by amount: CGFloat) -> some InsettableShape {
        var copy = self
        copy.insetAmount += amount
        return copy
    }
}

extension View {
    /// Clips the view to a pixel-cornered rect and strokes a hard black border.
    func pixelFrame(
        step: CGFloat = PixelTheme.notch,
        lineWidth: CGFloat = PixelTheme.border
    ) -> some View {
        clipShape(PixelRect(step: step))
            .overlay {
                PixelRect(step: step)
                    .strokeBorder(PixelTheme.ink, lineWidth: lineWidth)
            }
    }
}
